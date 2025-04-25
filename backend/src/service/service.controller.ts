import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, Patch, Query, ParseIntPipe} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createService(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const servicespId = user.id
    try 
    {
      const newService = await this.serviceService.create(createServiceDto, servicespId);
      return {
        message: 'Service created successfully',
        data: newService,
      };
    } 
    catch (err) {
      throw err;
    }
  }

  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteService(@Param('id') id: string, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const serviceId = parseInt(id);
    const servicespId = user.id;

    try
    {
      const result = await this.serviceService.delete(serviceId, servicespId);

      return {
        message: 'Service deleted successfully',
        data: result,
      };
    }
    catch(err){
      throw err
    }
  }

  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const serviceId = parseInt(id);
    const servicespId = user.id;

    try
    {
      const updated = await this.serviceService.update(serviceId, dto, servicespId);
  
      return {
        message: 'Service updated successfully',
        data: updated,
      };

    }
    catch(err){
      throw err
    }
  }

  @UseGuards(JwtAuthGuard)//only require a valid token regardless of role
  @Get()
  async getAllServices(@Query('spId') spIdString?: string, @Query('city') cityName?: string,): Promise<BaseResponseDto> {

    //if query params are provided, services are filtered by them
    //otherwise, return all services
    try {

      //filter by service provider
      if (spIdString) {
        const spId = parseInt(spIdString);
        const services = await this.serviceService.getAllServicesForProvider(spId);
        return {
          message: `List of services for provider with ID=${spId}`,
          data: services,
        };
      }

      //filter by city
      if (cityName) {
        const services = await this.serviceService.getServicesByCity(cityName);
        return {
          message: `List of services in city: ${cityName}`,
          data: services,
        };
      }

      //if no query params, return all services
      const services = await this.serviceService.getAllServices();
      return {
        message: 'List of all services',
        data: services,
      };
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':serviceId/schedule')
  async getServiceSchedule(@Param('serviceId', ParseIntPipe) serviceId: number,): Promise<BaseResponseDto> {
    const busyDates = await this.serviceService.getServiceSchedule(serviceId);
    return {
      message: 'Service schedule fetched',
      data: { busyDates },
    };
  }

}
