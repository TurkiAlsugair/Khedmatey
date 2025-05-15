import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, Patch, Query, ParseIntPipe} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CityName, Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiOperation({ summary: 'Create service', description: 'Create a new service as a service provider' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Service created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service created successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'service-uuid' },
            nameAR: { type: 'string', example: 'خدمة السباكة' },
            nameEN: { type: 'string', example: 'Plumbing Service' },
            price: { type: 'string', example: '100' },
            status: { type: 'string', example: 'PENDING' },
            serviceProviderId: { type: 'string', example: 'provider-uuid' },
            categoryId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Delete service', description: 'Delete a service as a service provider' })
  @ApiParam({ name: 'id', description: 'Service ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service deleted successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'service-uuid' },
            nameAR: { type: 'string', example: 'خدمة السباكة' },
            nameEN: { type: 'string', example: 'Plumbing Service' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - You do not have permission to delete this service' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteService(@Param('id') id: string, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const serviceId = id;
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

  @ApiOperation({ summary: 'Update service', description: 'Update an existing service as a service provider' })
  @ApiParam({ name: 'id', description: 'Service ID', type: 'string' })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Service updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service updated successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'service-uuid' },
            nameAR: { type: 'string', example: 'خدمة السباكة المحدثة' },
            nameEN: { type: 'string', example: 'Updated Plumbing Service' },
            price: { type: 'string', example: '120' },
            categoryId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Only ACCEPTED services can be updated or you do not have permission' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider' })
  @ApiResponse({ status: 404, description: 'Service or category not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    const serviceId = id;
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

  @ApiOperation({ summary: 'Get services', description: 'Get a list of services, optionally filtered by service provider ID or city' })
  @ApiQuery({ name: 'spId', required: false, description: 'Filter services by service provider ID' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter services by city name' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of services retrieved',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'List of all services'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'service-uuid' },
              nameAR: { type: 'string', example: 'خدمة السباكة' },
              nameEN: { type: 'string', example: 'Plumbing Service' },
              price: { type: 'string', example: '100' },
              status: { type: 'string', example: 'ACCEPTED' },
              serviceProvider: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'provider-uuid' },
                  username: { type: 'string', example: 'serviceCompany' }
                }
              },
              category: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Plumbing' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)//only require a valid token regardless of role
  @Get()
  async getAllServices(@Query('spId') spIdString?: string, @Query('city') cityName?: string): Promise<BaseResponseDto> {

    //if query params are provided, services are filtered by them
    //otherwise, return all services
    try {

      //filter by service provider
      if (spIdString) {
        const services = await this.serviceService.getAllServicesForProvider(spIdString);
        return {
          message: `List of services for provider with ID=${spIdString}`,
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

  @ApiOperation({ summary: 'Get service schedule', description: 'Get the schedule for a specific service, optionally filtered by city' })
  @ApiParam({ name: 'serviceId', description: 'Service ID', type: 'string' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter schedule by city' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service schedule retrieved',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service schedule fetched'
        },
        data: {
          type: 'object',
          properties: {
            busyDates: {
              type: 'array',
              items: { type: 'string' },
              example: ['2023-01-05', '2023-01-10']
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':serviceId/schedule')
  async getServiceSchedule(@Param('serviceId') serviceId: string, @Query('city') city?: string,): Promise<BaseResponseDto> {

    const busyDates = await this.serviceService.getSchedule(serviceId, city);
    return {
      message: 'Service schedule fetched',
      data: { busyDates },
    };
  }
  
}
