import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, Patch} from '@nestjs/common';
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
  async createService(@Body() dto: CreateServiceDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const serviceProviderId = user.id
    try 
    {
      const newService = await this.serviceService.create(dto, serviceProviderId);
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
    const serviceProviderId = user.id;

    try
    {
      const result = await this.serviceService.delete(serviceId, serviceProviderId);

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
    const serviceProviderId = user.id;

    try
    {
      const updated = await this.serviceService.update(serviceId, dto, serviceProviderId);
  
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
  @Get(':spId')
  async getSPServices(@Param('spId') spId: string): Promise<BaseResponseDto> {
    const providerId = parseInt(spId);
    const services = await this.serviceService.getAllServicesForProvider(providerId);

    return {
      message: 'List of services for the specified service provider',
      data: services,
    };
  }

}
