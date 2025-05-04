import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from "src/database/database.service";
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { cleanObject } from 'src/utils/cleanObject';
import { CityName, Prisma, Status } from '@prisma/client';
import { addDays, eachDayOfInterval, format, startOfDay } from 'date-fns';

@Injectable()
export class ServiceService {
  constructor(private prisma: DatabaseService) {}
  
  async create(dto: CreateServiceDto, serviceProviderId: number) {
    const { nameAR, nameEN, price, categoryId } = dto;

    // search the service provider know it status 
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });
    
    if (!serviceProvider) {
      throw new NotFoundException('Service provider not found');
    }
    
    // // Check if the provider is ACCEPTED
    // if (serviceProvider.status !== 'ACCEPTED') {
    //   throw new BadRequestException('Only ACCEPTED service providers can create services');
    // }

    //validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }


    //create service
    const newService = await this.prisma.service.create({
      data: {
        nameAR,
        nameEN,
        price,
        categoryId,
        serviceProviderId,
      },
      include: { //include the category info 
        category: true,
      },
    });

    return newService;
  }

  async delete(serviceId: number, serviceProviderId: number) {

    //check if serviceId is a number
    if (isNaN(serviceId)) {
      throw new BadRequestException('Invalid service ID');
    }

    //get service info
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    //check if the service exists
    if (!service) {
      throw new NotFoundException('Service not found');
    }
  
    //check ownership
    if (service.serviceProviderId !== serviceProviderId) {
      throw new BadRequestException('You do not have permission to delete this service');
    }
  
    const deletedService = await this.prisma.service.delete({
      where: { id: serviceId },
    });

    return deletedService
  }
  
  async update(serviceId: number, dto: UpdateServiceDto, serviceProviderId: number) {    

    //check if serviceId is a number
    if (isNaN(serviceId)) {
      throw new BadRequestException('Invalid service ID');
    }
    
    //get service info
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
  
    //check if the service exists
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Only allow updating ACCEPTED services
    if (service.status !== 'ACCEPTED') {
      throw new BadRequestException('Only ACCEPTED services can be updated');
    }
  
    //check ownership
    if (service.serviceProviderId !== serviceProviderId) {
      throw new BadRequestException('You do not have permission to delete this service');
    }
  
    //get category info  
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    //validate provided category exists
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    //update service info
    const updatedService = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        ...dto
      },
      include: {
        category: true,
      },
    });
  
    return updatedService;
  }
  
  async getAllServicesForProvider(spId: number) {

    //check if a number is provided
    if (isNaN(spId)) {
      throw new BadRequestException('Invalid service provider ID');
    }

    //check if provider exists
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: { id: spId },
    });

    if (!serviceProvider) {
      throw new NotFoundException('Service provider not found');
    }

    //query services for the sp
    const services = await this.prisma.service.findMany({
      where: {
        serviceProviderId: spId,
        status: Status.ACCEPTED
      },
      include: {
        serviceProvider: {
          select:
          {
            id: true,
            username: true,
            phoneNumber: true,
            email: true,
            status: true,
          }
        },
        category: true,
      },
    });

    const grouped = services.reduce<
    {
      categoryId:   string;
      categoryName: string;
      services: {
        serviceId:     string;
        nameEN:        string;
        nameAR:        string;
        price:         string;
        workersNeeded: string;
      }[];
    }[]>((acc, svc) => 
    {
      const catId = svc.category.id.toString();
      let bucket = acc.find(b => b.categoryId === catId);
      if (!bucket) {
        bucket = {
          categoryId:   catId,
          categoryName: svc.category.name,
          services:     [],
        };
        acc.push(bucket);
      }
      bucket.services.push({
        serviceId:     svc.id.toString(),
        nameEN:        svc.nameEN,
        nameAR:        svc.nameAR,
        price:         svc.price?.toString() ?? 'TBD',
        workersNeeded: svc.requiredNbOfWorkers.toString(),
      });
      return acc;
    }, []);

    return {
      data: {
        serviceProviderId: spId.toString(),
        services:          grouped,
      },
    };
  }

  async getAllServices() {

    const services = await this.prisma.service.findMany({
      where: {
        status: Status.ACCEPTED
      },
      include: {
        serviceProvider: {
          select:
          {
            id: true,
            username: true,
            phoneNumber: true,
            email: true,
            status: true,
          }
        },
        category: true,
      },
    });
  
    return services;
  }

  async getServicesByCity(cityNameStr: string) {

    //validate and get the city name by the enum
    const cityEnum = await this.parseCity(cityNameStr)

    //query all services from providers who serve this city
    const services = await this.prisma.service.findMany({
      where: {
        serviceProvider: {
          cities: {
            some: {
              name: cityEnum, 
            },
          },
        },
        status: Status.ACCEPTED
      },
      include: {
        category: true,
        serviceProvider: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
            email: true,
            status: true,
          },
        },
      },
    });

    return services;
  }

  /**
   * Returns an array of ISO‑dates (yyyy-MM-dd) over the next 30 days
   * on which the given service is unavailable because:
   * - providerDay.isClosed (manually blocked)
   * - providerDay.isBusy   (no worker capacity)
   * - providerDayService.isClosed (service‑specific closure)
   */
  async getServiceSchedule(serviceId: number, city?: string): Promise<string[]> {

    //find the service to get its provider
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { serviceProviderId: true, requiredNbOfWorkers: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    const providerId = service.serviceProviderId;

    //if city, validate it
    let cityFilter: CityName | undefined = undefined;
    if(city)
      cityFilter = await this.parseCity(city)
    
    //compute number of workers for the city
    let totalCityWorkers: number | undefined;
    if (cityFilter) {
      totalCityWorkers = await this.prisma.worker.count({
        where: {
          serviceProviderId: providerId,
          city: { name: cityFilter },
        },
      });
    }

    //compute date range
    const today = startOfDay(new Date());
    const end   = addDays(today, 29);

    //fetch all ProviderDay rows in the date range, plus the services specific schedule
    const rows = await this.prisma.providerDay.findMany({
      where: {
        serviceProviderId: providerId,
        date: { gte: today, lte: end },
      },
      include: {
        ServiceDays: {
          where: { serviceId: serviceId },
          select: { isClosed: true },
        },
        //get workers for the specific city
        WorkerDays: cityFilter
          ? {
              where: {
                worker: { city: { name: cityFilter } },
              },
              select: { id: true, nbOfAssignedRequests: true, capacity: true },
            }
          : undefined,
      },
    });

    //build lookup map: key = date.toDateString(), value = true if any closed/busy
    //no differenciation between closed and busy, cuz only one array is returned
    const unavailableMap = new Map<string, true>();
    for (const r of rows) {
      const key = r.date.toDateString();
      
      //manually closed or out of workers
      if (r.isClosed || r.isBusy) {
        unavailableMap.set(key, true);
        continue;
      }
      //service specifc close
      //legth is checked because if no request happens on that day for the service, no row would exist.
      if (r.ServiceDays.length > 0 && r.ServiceDays[0].isClosed) {
        unavailableMap.set(key, true);
        continue
      }

      //city specific close (not enough workers in city)
      if(cityFilter)
        {
          const dayWorkers = r.WorkerDays ?? [];
          // count how many are fully booked
          const closedWorkersCount = dayWorkers.filter(
            (dw) => dw.nbOfAssignedRequests >= dw.capacity).length;
          
          const freeWorkersCount = (totalCityWorkers! - closedWorkersCount);
          if (freeWorkersCount < service.requiredNbOfWorkers) {
            unavailableMap.set(key, true);
            continue;
          }
        }
    }

    //walk each day in the interval and collect ISO strings for unavailable ones
    const busyDates: string[] = [];
    eachDayOfInterval({ start: today, end }).forEach((d) => {
      const key = d.toDateString();
      if (unavailableMap.has(key)) {
        busyDates.push(format(d, 'yyyy-MM-dd'));
      }
    });

    return busyDates;
  }

  //helper
  async parseCity(cityNameStr: string) {
    //normalize
    cityNameStr = cityNameStr.charAt(0).toUpperCase() + cityNameStr.slice(1).toLowerCase();
    //validate that the string is a valid enum value
    if (!Object.values(CityName).includes(cityNameStr as CityName)) {
      throw new BadRequestException(`Invalid city: ${cityNameStr}`);
    }
    return cityNameStr as CityName;
  }
}
