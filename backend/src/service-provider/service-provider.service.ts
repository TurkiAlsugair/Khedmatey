import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';
import { CreateWorkerDto } from './dtos/create-worker.dto'
import { UpdateWorkerDto } from './dtos/update-worker.dto'
import { CityName, Status } from '@prisma/client';
import { addDays, eachDayOfInterval, format, formatISO, startOfDay } from 'date-fns';
import { RequestService } from 'src/request/request.service';
import { ServiceService } from 'src/service/service.service';
import { forwardRef } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ServiceProviderService {
    constructor(
      private prisma: DatabaseService, 
      private twilio: TwilioService,
      @Inject(forwardRef(() => RequestService)) private requestService: RequestService, 
      @Inject(forwardRef(() => ServiceService)) private serviceService: ServiceService, private authService: AuthService  
    ){}

    async createWorker(dto: CreateWorkerDto, serviceProviderId: string) {

        //check if phonenumber exists
        const existingUser = await this.authService.findUser({ phoneNumber: dto.phoneNumber });
        if (existingUser) {
          throw new ConflictException('Worker with this phone number already exists');
        }

        //check service provider
        const provider = await this.prisma.serviceProvider.findUnique({
          where: { id: serviceProviderId },
          include: { cities: true },
        });
        if (!provider) {
          throw new NotFoundException(`Service provider not found`);
        }

        const cityName = await this.serviceService.parseCity(dto.city)

        //find the city by name
        const city = await this.prisma.city.findUnique({
          where: { name: cityName }, 
        });
        if (!city) {
          throw new NotFoundException(`City '${dto.city}' not found`);
        }

        //ensure the city is one of the provider's supported cities
        const providerCityIds = provider.cities.map((c) => c.id);
        if (!providerCityIds.includes(city.id)) {
          throw new BadRequestException(
            `City '${city.name}' is not supported by worker's service provider `
          );
        }

        //verify otp
        // try {
        //   await this.twilio.verifyOtp(phoneNumber, otpCode);
        // } 
        // catch (err) {
        //   throw err;
        // }
      
        //create worker
        const worker = await this.prisma.worker.create({
          data: 
          {
            username: dto.username,
            phoneNumber: dto.phoneNumber,
            serviceProvider: {
              connect: { id: serviceProviderId },
            },
            city: { 
              connect: { id: city.id } 
            },
          },
        });

        //destruct the city id and return the city name instead
        const { cityId, ...rest } = worker;

        return {
          ...rest,
          city: city.name,
        };
    }

    async findProvidersByCity(cityNameStr: string) {
      
      //validate and get the city name by the enum
      const cityEnum = await this.serviceService.parseCity(cityNameStr)
      
      //get the city
      const city = await this.prisma.city.findUnique({
        where: {
          name: cityEnum,
        },
        include: 
        {
          providers: 
          {
            include: {
              cities: true,
            },
            //only return accepted providers
            where: {
              status: Status.ACCEPTED
            },
          },
        },
      });
  
      //this check is needed because it is already checked using parseCity but it is needed so that city.providers works
      if (!city) {
        throw new NotFoundException(`City '${cityNameStr}' not found`);
      }
  
      //return the providers array
      return city.providers;
    }

    async findAllProviders() {
      return this.prisma.serviceProvider.findMany({
        where: {
          status: Status.ACCEPTED
        },
        include: {
          cities: true
          
        },
      });
    }

    //returns 2 arrays, blockedDays and busyDays
    async getNext30DaysSchedule(providerId: string, city?: string) {

      //check if provider exists
      const provider = await this.prisma.serviceProvider.findUnique({
        where: { id: providerId },
      });
      if (!provider) {
        throw new NotFoundException(`Service provider not found`);
      }

      //if city, validate it
      let cityFilter: CityName | undefined = undefined;
      if(city)
        cityFilter = await this.serviceService.parseCity(city)

      //get today and next 30 days(inclusive)
      const today = startOfDay(new Date());
      const end = addDays(today, 29);
  
      // fetch only rows that actually exist in DB
      const rows = await this.prisma.providerDay.findMany({
        where: {
          serviceProviderId: providerId,
          date: { gte: today, lte: end },
        },
        select: { 
          date: true, 
          isClosed: true, 
          isBusy: true,
          //include worker days if filtering by city
          ...(cityFilter && {
            WorkerDays: {
              where: {
                worker: { city: { name: cityFilter } },
              },
              select: { 
                id: true, 
                nbOfAssignedRequests: true, 
                capacity: true,
                worker: {
                  select: {
                    id: true,
                    city: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              },
            }
          })
        },
      });
      
  
      // quick maps for O(1) lookup, value of true is arbitrary cuz we only care about existence
      const closedMap = new Map(
        rows.filter(r => r.isClosed).map(r => [r.date.toDateString(), true]),
      );
      
      // For busy days, consider both provider's isBusy flag and city-specific worker availability
      const busyMap = new Map();
      
      for (const row of rows) {
        
        if (row.isClosed) continue;
        
        //check if the day is marked as busy at the provider level
        if (row.isBusy) {
          busyMap.set(row.date.toDateString(), true);
          continue;
        }
        
        //if filtering by city, check workers availability
        if (cityFilter && 'WorkerDays' in row) {
          const workerDays = row.WorkerDays as any[];
          
          //if there are no workers in this city, mark as busy
          if (workerDays.length === 0) {
            busyMap.set(row.date.toDateString(), true);
            continue;
          }
          
          //check if all workers in this city are fully booked
          const allBusy = workerDays.every(wd => wd.nbOfAssignedRequests >= wd.capacity);
          if (allBusy) {
            busyMap.set(row.date.toDateString(), true);
          }
        }
      }
  
      const blockedDates: string[] = [];
      const busyDates: string[]    = [];
  
      // iterate through full 30‑day range and check each date against the maps
      eachDayOfInterval({ start: today, end }).forEach(d => {
        const key = d.toDateString();              
        const iso = format(d, 'dd/MM/yyyy');       
  
        if (closedMap.has(key)) blockedDates.push(iso);
        else if (busyMap.has(key)) busyDates.push(iso);
      });
  
      return { blockedDates, busyDates };
    }

    async replaceBlockedDays(providerId: string, newDates: string[],): Promise<string[]> {
      const todayMidnight = startOfDay(new Date());
      const maxRange = addDays(todayMidnight, 30);
  
      //validate date is in correct format and time and return as date object
      const normalizedDates: Date[] = newDates.map((dateStr) =>
        this.requestService.validateDate(dateStr)
      );

      const wantClosedMap: Map<string, Date> = new Map(
        normalizedDates.map((d) => [
          formatISO(d, { representation: 'date' }),
          d,
        ]),
      );

      //close requested dates and open others
      await this.prisma.$transaction(async (tx) => {
        //fetch all providerDay rows in the range
        const existing = await tx.providerDay.findMany({
          where: {
            serviceProviderId: providerId,
            date: { gte: todayMidnight, lte: maxRange },
          },
          select: { id: true, date: true, isClosed: true },
        });
  
      //loop over database rows
      for (const row of existing) 
      {
        const iso = formatISO(row.date, { representation: 'date' });

        //if date exist in want closed dates, close it
        if (wantClosedMap.has(iso)) 
        {
          if (!row.isClosed) {
            await tx.providerDay.update({
              where: { id: row.id },
              data:  { isClosed: true },
            });
          }

          //delete from want closed
          wantClosedMap.delete(iso);
        } 
        //otherwise open it
        else 
        {
          if (row.isClosed) {
            await tx.providerDay.update({
              where: { id: row.id },
              data:  { isClosed: false },
            });
          }
        }
      }
      
      //any keys still in wantClosedMap are new dates → create them closed
      for (const [iso, dateObj] of wantClosedMap) {
        await tx.providerDay.create({
          data: {
            serviceProviderId: providerId,
            date:              dateObj,
            isClosed:          true,
            isBusy:            false,
            totalRequestsCount: 0,
          },
        });
      }

      });
  
      return newDates
    }

    /**
     * Get all complaints for a service provider
     */
    async getComplaints(serviceProviderId: string) {

      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: serviceProviderId },
      });

      if (!serviceProvider) {
        throw new NotFoundException('Service provider not found');
      }

      const complaints = await this.prisma.complaint.findMany({
        where: { serviceProviderId },
        include: {
          request: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              customer: {
                select: {
                  id: true,
                  username: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return complaints;
    }

    async getProviderStats(serviceProviderId: string) {
      //check if provider exists
      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: serviceProviderId },
        select: {
          avgRating: true
        }
      });

      if (!serviceProvider) {
        throw new NotFoundException('Service provider not found');
      }

      //total workers count
      const totalWorkers = await this.prisma.worker.count({
        where: { serviceProviderId }
      });

      //total services count
      const totalServices = await this.prisma.service.count({
        where: { serviceProviderId }
      });

      //get all request status for this provider
      const requests = await this.prisma.request.findMany({
        where: {
          service: {
            serviceProviderId
          }
        },
        select: {
          status: true
        }
      });

      //group requests by status
      const statusCounts = {};
      const allStatuses = Object.values(Status);
      
      //initialize all statuses with 0 count
      allStatuses.forEach(status => {
        statusCounts[status] = 0;
      });
      
      //count requests by status
      requests.forEach(request => {
        statusCounts[request.status]++;
      });

      return {
        totalWorkers,
        totalServices,
        totalRequests: requests.length,
        requestsByStatus: statusCounts,
        avgRating: serviceProvider.avgRating
      };
    }

    async getWorkerStats(workerId: string) {
      //check if worker exists
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          city: true
        }
      });

      if (!worker) {
        throw new NotFoundException('Worker not found');
      }

      const workerDays = await this.prisma.workerDay.findMany({
        where: { workerId },
        include: {
          requests: {
            select: {
              id: true,
              status: true
            }
          },
          followUpRequests: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      let allRequests: { id: string; status: Status }[] = [];
      workerDays.forEach(day => {
        allRequests = [...allRequests, ...day.requests, ...day.followUpRequests];
      });

      const statusCounts = {};
      const allStatuses = Object.values(Status);
      
      //initialize all statuses with 0 count
      allStatuses.forEach(status => {
        statusCounts[status] = 0;
      });
      
      allRequests.forEach(request => {
        statusCounts[request.status]++;
      });

      return {
        workerId: worker.id,
        username: worker.username,
        phoneNumber: worker.phoneNumber,
        city: worker.city.name,
        totalRequests: allRequests.length,
        requestsByStatus: statusCounts
      };
    }

    async getWorkersByCity(providerId: string) {
      //check if provider exists
      const provider = await this.prisma.serviceProvider.findUnique({
        where: { id: providerId },
      });
      if (!provider) {
        throw new NotFoundException(`Service provider not found`);
      }

      //get all provider's workers with their cities
      const workers = await this.prisma.worker.findMany({
        where: { serviceProviderId: providerId },
        include: {
          city: true
        }
      });

      //transform workers to include city name directly
      const formattedWorkers = workers.map(worker => {
        const { city, ...workerWithoutCity } = worker;
        return {
          ...workerWithoutCity,
          city: city.name
        };
      });

      //group workers by city
      const groupingKey = (worker: any) => worker.city;
      const groupingsSet = new Set(formattedWorkers.map(groupingKey));
      
      const result = Array.from(groupingsSet).map(grouping => {
        const filteredWorkers = formattedWorkers.filter(worker => 
          groupingKey(worker) === grouping
        );
        
        return {
          city: grouping,
          workers: filteredWorkers
        };
      });
      
      return result;
    }

    async updateWorker(workerId: string, serviceProviderId: string, dto: UpdateWorkerDto) {
      
      //check if worker exists and belongs to the service provider
      const worker = await this.prisma.worker.findUnique({
        where: { 
          id: workerId,
          serviceProviderId
        },
        include: {
          city: true
        }
      });

      if (!worker) {
        throw new NotFoundException(`Worker not found or doesn't belong to this service provider`);
      }

      const updateData: any = {};

      updateData.username = dto.username;
      

      if (dto.phoneNumber) {
        const existingUser = await this.authService.findUser({ phoneNumber: dto.phoneNumber });
        if (existingUser && existingUser.id !== workerId) {
          throw new ConflictException('Phone number already used by another user');
        }
      }
      updateData.phoneNumber = dto.phoneNumber;


      if (dto.city) {
        const cityName = await this.serviceService.parseCity(dto.city);
        
        const city = await this.prisma.city.findUnique({
          where: { name: cityName }, 
        });
        if (!city) {
          throw new NotFoundException(`City '${dto.city}' not found`);
        }

        //check if city is supported by the service provider
        const provider = await this.prisma.serviceProvider.findUnique({
          where: { id: serviceProviderId },
          include: { cities: true },
        });
        
        if (!provider) {
          throw new NotFoundException(`Service provider not found`);
        }
        
        const providerCityIds = provider.cities.map((c) => c.id);
        if (!providerCityIds.includes(city.id)) {
          throw new BadRequestException(
            `City '${city.name}' is not supported by worker's service provider`
          );
        }
        updateData.city = {
          connect: { id: city.id }
        };
      }

      //update the worker
      const updatedWorker = await this.prisma.worker.update({
        where: { id: workerId },
        data: updateData,
        include: {
          city: true
        }
      });

      const { city, cityId, ...rest } = updatedWorker;
      return {
        ...rest,
        city: city.name,
      };
    }

    async deleteWorker(workerId: string, serviceProviderId: string) {
      
      //check if worker exists and belongs to the service provider
      const worker = await this.prisma.worker.findUnique({
        where: { 
          id: workerId,
          serviceProviderId
        }
      });

      if (!worker) {
        throw new NotFoundException(`Worker not found or doesn't belong to this service provider`);
      }

      //check if worker has any assigned requests
      const workerDays = await this.prisma.workerDay.findMany({
        where: { workerId },
        include: {
          requests: {
            where: {
              status: {
                in: [Status.PENDING, Status.ACCEPTED, Status.COMING, Status.IN_PROGRESS]
              }
            }
          },
          followUpRequests: {
            where: {
              status: {
                in: [Status.PENDING, Status.ACCEPTED, Status.COMING, Status.IN_PROGRESS]
              }
            }
          }
        }
      });

      //check if worker has any active requests
      const hasActiveRequests = workerDays.some(day => 
        day.requests.length > 0 || day.followUpRequests.length > 0
      );

      if (hasActiveRequests) {
        throw new BadRequestException('Cannot delete worker with active requests');
      }

      //delete the worker
      await this.prisma.worker.delete({
        where: { id: workerId }
      });

      return { id: workerId };
    }
}
