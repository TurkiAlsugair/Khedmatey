import { Body, Controller, Get, Param, Post, Query, UseGuards, ForbiddenException, Patch, Delete } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateWorkerDto } from './dtos/create-worker.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UpdateWorkerDto } from './dtos/update-worker.dto';

@ApiTags('service-provider')
@Controller('service-provider')
export class ServiceProviderController {
  constructor(private serviceProviderService: ServiceProviderService) {}

  @ApiOperation({ summary: 'Add worker', description: 'Create a new worker account under the service provider' })
  @ApiBody({ type: CreateWorkerDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Worker created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Worker created successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'worker-uuid' },
            username: { type: 'string', example: 'workerName' },
            phoneNumber: { type: 'string', example: '+123456789' },
            role: { type: 'string', example: 'WORKER' },
            city: { type: 'string', example: 'RIYADH' }
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
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Post(':id/workers')
  async addWorker(@Body() dto: CreateWorkerDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try {
      const serviceProviderId = user.id;
      const worker = await this.serviceProviderService.createWorker(dto, serviceProviderId);

      return {
        message: 'Worker created successfully',
        data: worker,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get service providers', description: 'Retrieve a list of service providers, optionally filtered by city' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter providers by city name' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of service providers retrieved',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'List of all service providers'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'provider-uuid' },
              username: { type: 'string', example: 'serviceCompany' },
              email: { type: 'string', example: 'service@example.com' },
              status: { type: 'string', example: 'APPROVED' },
              cities: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['RIYADH', 'JEDDAH']
              },
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'service-uuid' },
                    nameAR: { type: 'string', example: 'خدمة السباكة' },
                    nameEN: { type: 'string', example: 'Plumbing Service' },
                    status: { type: 'string', example: 'ACCEPTED' }
                  }
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
  @UseGuards(JwtAuthGuard) // or remove if you want public access
  @Get()
  async getProviders(@Query('city') cityName?: string): Promise<BaseResponseDto> {
    try {
      //if 'city' query param is provided, filter by city
      if (cityName) {
        const providers = await this.serviceProviderService.findProvidersByCity(cityName);

        return {
          message: `List of providers in city: ${cityName}`,
          data: providers,
        };
      }

      //otherwise, return all providers
      const providers = await this.serviceProviderService.findAllProviders();
      return {
        message: 'List of all service providers',
        data: providers,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get provider schedule', description: 'Retrieve the next 30 days schedule for a service provider' })
  @ApiParam({ name: 'id', description: 'Service Provider ID', type: 'string' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter schedule by city name' })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'List of blocked dates and busy dates'
        },
        data: {
          type: 'object',
          properties: {
            blockedDays: {
              type: 'array',
              items: { type: 'string' },
              example: ['2023-01-01', '2023-01-02']
            },
            busyDays: {
              type: 'array',
              items: { type: 'string' },
              example: ['2023-01-05', '2023-01-10']
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid city parameter' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id/schedule')
  async getSchedule(@Param('id') providerId: string, @Query('city') city?: string): Promise<BaseResponseDto> {
    try
    {
      const schedule = await this.serviceProviderService.getNext30DaysSchedule(providerId, city);
      return {
        message: 'List of blocked dates and busy dates', 
        data: schedule, 
      };
    }
    catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update provider schedule', description: 'Update the blocked days for a service provider' })
  @ApiParam({ name: 'id', description: 'Service Provider ID', type: 'string' })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Schedule updated'
        },
        data: {
          type: 'object',
          properties: {
            blockedDays: {
              type: 'array',
              items: { type: 'string' },
              example: ['2023-01-01', '2023-01-02']
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner of this service provider account' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Post(':id/schedule')
  async updateSchedule(@Body() dto: UpdateScheduleDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try
    {
      const closed = await this.serviceProviderService.replaceBlockedDays(user.id, dto.dates);
      return { message: 'Schedule updated', data: { blockedDays: closed } };
    }
    catch(err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Get complaints', description: 'Retrieve all complaints submitted for a service provider' })
  @ApiParam({ name: 'id', description: 'Service Provider ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Complaints retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Complaints retrieved'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'complaint-uuid' },
              description: { type: 'string', example: 'The service was not completed as expected' },
              createdAt: { type: 'string', format: 'date-time' },
              request: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'request-uuid' },
                  status: { type: 'string', example: 'FINISHED' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to view these complaints' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id/complaints')
  async getComplaints(@Param('id') id: string, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try {
      // Only allow service providers to see their own complaints or admins to see any complaints
      if (user.role !== Role.ADMIN && (user.role !== Role.SERVICE_PROVIDER || user.id !== id)) {
        throw new ForbiddenException('You can only view your own complaints');
      }

      const complaints = await this.serviceProviderService.getComplaints(id);
      
      return {
        message: 'Complaints retrieved',
        data: complaints
      };
    } 
    catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get provider statistics', description: 'Retrieve statistics for a service provider' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Provider statistics retrieved'
        },
        data: {
          type: 'object',
          properties: {
            totalWorkers: { type: 'number', example: 5 },
            totalServices: { type: 'number', example: 8 },
            totalRequests: { type: 'number', example: 125 },
            requestsByStatus: { 
              type: 'object',
              properties: {
                PENDING: { type: 'number', example: 10 },
                ACCEPTED: { type: 'number', example: 20 },
                DECLINED: { type: 'number', example: 5 },
                CANCELED: { type: 'number', example: 15 },
                COMING: { type: 'number', example: 25 },
                IN_PROGRESS: { type: 'number', example: 30 },
                FINISHED: { type: 'number', example: 10 },
                INVOICED: { type: 'number', example: 5 },
                PAID: { type: 'number', example: 5 }
              }
            },
            avgRating: { type: 'number', example: 4.5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  async getStats(@CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try {
      if (user.role !== Role.SERVICE_PROVIDER) {
        throw new ForbiddenException('Only service providers can access their statistics');
      }

      const stats = await this.serviceProviderService.getProviderStats(user.id);
      return {
        message: 'Provider statistics retrieved',
        data: stats,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get worker statistics', description: 'Retrieve statistics for the current worker' })
  @ApiResponse({ 
    status: 200, 
    description: 'Worker statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Worker statistics retrieved'
        },
        data: {
          type: 'object',
          properties: {
            workerId: { type: 'string', example: 'worker-uuid' },
            username: { type: 'string', example: 'workerName' },
            phoneNumber: { type: 'string', example: '+123456789' },
            city: { type: 'string', example: 'Riyadh' },
            totalRequests: { type: 'number', example: 50 },
            requestsByStatus: { 
              type: 'object',
              properties: {
                PENDING: { type: 'number', example: 5 },
                ACCEPTED: { type: 'number', example: 10 },
                DECLINED: { type: 'number', example: 2 },
                CANCELED: { type: 'number', example: 3 },
                COMING: { type: 'number', example: 15 },
                IN_PROGRESS: { type: 'number', example: 5 },
                FINISHED: { type: 'number', example: 5 },
                INVOICED: { type: 'number', example: 3 },
                PAID: { type: 'number', example: 2 }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a worker' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.WORKER)
  @Get('workers/stats')
  async getWorkerStats(@CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try {
      const stats = await this.serviceProviderService.getWorkerStats(user.id);
      
      return {
        message: 'Worker statistics retrieved',
        data: stats,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get workers by city', description: 'Retrieve all workers for a service provider, categorized by city' })
  @ApiParam({ name: 'id', description: 'Service Provider ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Workers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Workers retrieved successfully'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              city: { 
                type: 'string', 
                example: 'Riyadh',
                description: 'City name'
              },
              workers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { 
                      type: 'string', 
                      example: 'worker-uuid',
                      description: 'Worker ID'
                    },
                    username: { 
                      type: 'string', 
                      example: 'workerName',
                      description: 'Worker username'
                    },
                    phoneNumber: { 
                      type: 'string', 
                      example: '+123456789',
                      description: 'Worker phone number'
                    },
                    role: { 
                      type: 'string', 
                      example: 'WORKER',
                      description: 'User role'
                    },
                    serviceProviderId: { 
                      type: 'string', 
                      example: 'provider-uuid',
                      description: 'ID of the service provider this worker belongs to'
                    },
                    city: { 
                      type: 'string', 
                      example: 'Riyadh',
                      description: 'City where worker operates' 
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Get(':id/workers')
  async getWorkersByCity(@Param('id') providerId: string): Promise<BaseResponseDto> {
    try {
      const workersByCity = await this.serviceProviderService.getWorkersByCity(providerId);
      
      return {
        message: 'Workers retrieved successfully',
        data: workersByCity
      };
    } 
    catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update worker account', description: 'Update worker information including username, phone number, and city' })
  @ApiParam({ name: 'providerId', description: 'Service Provider ID', type: 'string' })
  @ApiParam({ name: 'workerId', description: 'Worker ID', type: 'string' })
  @ApiBody({ type: UpdateWorkerDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Worker updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Worker updated successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'worker-uuid' },
            username: { type: 'string', example: 'updatedWorkerName' },
            phoneNumber: { type: 'string', example: '+123456789' },
            role: { type: 'string', example: 'WORKER' },
            city: { type: 'string', example: 'RIYADH' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Worker or service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Patch(':id/workers/:workerId/account')
  async updateWorker(@Param('id') providerId: string, @Param('workerId') workerId: string, @Body() dto: UpdateWorkerDto): Promise<BaseResponseDto> {
    try 
    {
      const updatedWorker = await this.serviceProviderService.updateWorker(workerId, providerId, dto);
      
      return {
        message: 'Worker updated successfully',
        data: updatedWorker,
      };
    } 
    catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete worker', description: 'Delete a worker account' })
  @ApiParam({ name: 'id', description: 'Service Provider ID', type: 'string' })
  @ApiParam({ name: 'workerId', description: 'Worker ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Worker deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Worker deleted successfully'
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'worker-uuid' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Worker has active requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Worker or service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Delete(':id/workers/:workerId')
  async deleteWorker(@Param('id') providerId: string, @Param('workerId') workerId: string): Promise<BaseResponseDto> {
    try {
      const result = await this.serviceProviderService.deleteWorker(workerId, providerId);
      
      return {
        message: 'Worker deleted successfully',
        data: result
      };
    } 
    catch (err) {
      throw err;
    }
  }
}
