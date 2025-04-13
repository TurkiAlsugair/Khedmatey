import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from "src/database/database.service";
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { cleanObject } from 'src/utils/cleanObject';
import { CityName, Prisma, Status } from '@prisma/client';

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

    return services;
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

  //helper
  async parseCity(cityNameStr: string) {
    //calidate that the string is a valid enum value
    if (!Object.values(CityName).includes(cityNameStr as CityName)) {
      throw new BadRequestException(`Invalid city: ${cityNameStr}`);
    }
    return cityNameStr as CityName;
  }
}
