import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from "src/database/database.service";
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { cleanObject } from 'src/utils/cleanObject';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(private prisma: DatabaseService) {}
  
  async create(dto: CreateServiceDto, serviceProviderId: number) {
    const { name, price, categoryId, customCategory } = dto;

    //validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    //this is only for now until how the 'other' category will be handled is decided
    //if category is "Other", customCategory is required
    if (category.name === 'Other' && !customCategory) {
      throw new BadRequestException("customCategory is required for the category 'Other' ");
    }

    //create service
    const newService = await this.prisma.service.create({
      data: {
        name,
        price,
        categoryId,
        customCategory,
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
  
    //this is only for now until how the 'other' category will be handled is decided
    //if category is "Other", customCategory is required
    if (category.name === 'Other' && !dto.customCategory) {
      throw new BadRequestException("customCategory is required for the category 'Other' ");
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
  
}
