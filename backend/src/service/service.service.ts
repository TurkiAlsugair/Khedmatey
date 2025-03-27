import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from "src/database/database.service";
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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
  
}
