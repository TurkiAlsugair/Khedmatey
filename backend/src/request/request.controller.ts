import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { Role, Status } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateRequestStatusDto } from './dtos/update-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AddInvoiceItemDto } from './dtos/add-invoice-item.dto';
import { CreateFeedbackDto } from './dtos/feedback.dto';
import { CreateComplaintDto } from './dtos/complaint.dto';

@ApiTags('request')
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

    @ApiOperation({ summary: 'Create request', description: 'Create a new service request as a customer' })
    @ApiBody({ type: CreateRequestDto })
    @ApiResponse({ 
      status: 201, 
      description: 'Request created successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Request created successfully'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'request-uuid' },
              status: { type: 'string', example: 'PENDING' },
              serviceId: { type: 'string', example: 'service-uuid' },
              customerId: { type: 'string', example: 'customer-uuid' },
              notes: { type: 'string', example: 'Please come before noon' },
              providerDayId: { type: 'string', example: 'provider-day-uuid' },
              locationId: { type: 'string', example: 'location-uuid' },
              createdAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
              updatedAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
              dailyWorkers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'daily-worker-uuid' },
                    workerId: { type: 'string', example: 'worker-uuid' }
                  }
                }
              },
              location: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'location-uuid' },
                  city: { type: 'string', example: 'RIYADH' },
                  fullAddress: { type: 'string', example: '123 Main St, Riyadh' },
                  miniAddress: { type: 'string', example: 'Al Olaya District' },
                  lat: { type: 'number', example: 24.7136 },
                  lng: { type: 'number', example: 46.6753 }
                }
              },
              providerDay: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'provider-day-uuid' },
                  date: { type: 'string', example: '2023-01-15T00:00:00.000Z' }
                }
              }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data, customer has unpaid invoices, or customer already has a request scheduled for the same day' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not a customer' })
    @ApiResponse({ status: 404, description: 'Service not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    async createRequest(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
    {
      try 
      {
        const createdRequest = await this.requestService.createRequest(createRequestDto, user.id);
        return {
          message: 'Request created successfully',
          data: createdRequest,
        };
      } 
      catch (err) {
        throw err;
      }
    }

    @ApiOperation({ 
      summary: 'Update request status', 
      description: `Update the status of a service request. Status transitions follow these rules:
      - PENDING → ACCEPTED/DECLINED (by service provider) or CANCELLED (by customer)
      - ACCEPTED → COMING (by worker) or CANCELLED (by customer)
      - COMING → IN_PROGRESS or CANCELLED (by worker)
      - IN_PROGRESS → CANCELLED or FINISHED (by worker)
      - FINISHED → INVOICED (by worker)
      - INVOICED → PAID (by customer)
      
      Note: When cancelling a request that already has invoice items, the status will be set to INVOICED instead of CANCELLED.` 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiBody({ type: UpdateRequestStatusDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Status updated successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Status updated'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'request-uuid' },
              status: { type: 'string', example: 'ACCEPTED' },
              serviceId: { type: 'string', example: 'service-uuid' },
              customerId: { type: 'string', example: 'customer-uuid' },
              providerDayId: { type: 'string', example: 'provider-day-uuid' },
              locationId: { type: 'string', example: 'location-uuid' },
              notes: { type: 'string', example: 'Please come before noon' },
              createdAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
              updatedAt: { type: 'string', example: '2023-01-15T09:30:00.000Z' },
              followupServiceId: { 
                type: 'string', 
                example: 'followup-service-uuid',
                nullable: true 
              },
              followUpProviderDayId: { 
                type: 'string', 
                example: 'followup-provider-day-uuid',
                nullable: true 
              }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid status transition' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to update this request Or request is cancelled' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @CurrentUser() user: GenerateTokenDto, @Body() dto: UpdateRequestStatusDto): Promise<BaseResponseDto> {
      try
      {
        const data = await this.requestService.updateStatus(id, user, dto.status);
        return { message: 'Status updated', data };
      }
      catch(error){
        throw error
      }
    }

    @ApiOperation({ 
      summary: 'Get requests', 
      description: 'Get all requests for the current user. For customers, returns their requests grouped by status. For service providers, returns requests grouped by city.'
    })
    @ApiQuery({ 
      name: 'status', 
      required: false, 
      description: 'Filter requests by status. Can be a single status or an array of statuses.',
      type: 'string',
      isArray: true
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Requests fetched successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Requests fetched'
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                city: { 
                  type: 'string', 
                  example: 'Riyadh',
                  description: 'City name (for service providers)'
                },
                status: {
                  type: 'string',
                  example: 'PENDING',
                  description: 'Request status (for customers)'
                },
                requests: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { 
                        type: 'string', 
                        example: 'request-uuid',
                        description: 'Request ID'
                      },
                      date: { 
                        type: 'string', 
                        example: '15/01/2023',
                        description: 'Formatted date of the request'
                      },
                      totalPrice: { 
                        type: 'string', 
                        example: '150',
                        description: 'Total price of all invoice items or "NA" if not invoiced'
                      },
                      serviceProvider: {
                        type: 'object',
                        properties: {
                          username: { type: 'string', example: 'serviceCompany' },
                          usernameAR: { type: 'string', example: 'شركة الخدمات' }
                        },
                        description: 'Service provider details'
                      },
                      customer: {
                        type: 'object',
                        properties: {
                          username: { type: 'string', example: 'customerName' },
                          phoneNumber: { type: 'string', example: '+123456789' }
                        },
                        description: 'Customer details'
                      },
                      status: { 
                        type: 'string', 
                        example: 'PENDING',
                        description: 'Current status of the request'
                      },
                      notes: { 
                        type: 'string', 
                        example: 'Please come before noon',
                        description: 'Additional notes for the request'
                      },
                      service: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'service-uuid' },
                          nameEN: { type: 'string', example: 'Plumbing Service' },
                          nameAR: { type: 'string', example: 'خدمة السباكة' },
                          price: { type: 'string', example: '100' },
                          descriptionEN: { type: 'string', example: 'Full plumbing service' },
                          descriptionAR: { type: 'string', example: 'خدمة السباكة الكاملة' }
                        },
                        description: 'Service details'
                      },
                      location: {
                        type: 'object',
                        properties: {
                          miniAddress: { type: 'string', example: 'Al Olaya District' },
                          fullAddress: { type: 'string', example: '123 Main St, Riyadh' },
                          city: { type: 'string', example: 'Riyadh' },
                          lat: { type: 'number', example: 24.7136 },
                          lng: { type: 'number', example: 46.6753 }
                        },
                        description: 'Location details'
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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get() 
    async getRequests(
      @CurrentUser() user: GenerateTokenDto, 
      @Query('status') status?: Status | Status[]
    ): Promise<BaseResponseDto> {
      try {
        //ensure status is always an array
        const statusArray = status 
          ? Array.isArray(status) ? status : [status] 
          : undefined;
          
        const data = await this.requestService.getRequests(user, statusArray);
        return { message: 'Requests fetched', data };
      }
      catch(err) {
        throw err;
      }
    }

    @ApiOperation({ 
      summary: 'Get request by ID', 
      description: 'Get detailed information about a specific request by its ID. The response includes all related data such as service details, customer information, location, workers, and invoice items.' 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiResponse({ 
      status: 200, 
      description: 'Request fetched successfully. Response includes complete request details with related entities.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Request fetched'
              },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'request-uuid' },
                  status: { type: 'string', example: 'PENDING' },
                  notes: { type: 'string', example: 'Please come before noon' },
                  createdAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
                  service: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'service-uuid' },
                      nameAR: { type: 'string', example: 'خدمة السباكة' },
                      nameEN: { type: 'string', example: 'Plumbing Service' },
                      serviceProvider: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'provider-uuid' },
                          username: { type: 'string', example: 'serviceCompany' }
                        }
                      }
                    }
                  },
                  customer: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'customer-uuid' },
                      username: { type: 'string', example: 'customerName' }
                    }
                  },
                  location: {
                    type: 'object',
                    properties: {
                      city: { type: 'string', example: 'RIYADH' },
                      fullAddress: { type: 'string', example: '123 Main St, Riyadh' },
                      miniAddress: { type: 'string', example: 'Al Olaya District' },
                      lat: { type: 'number', example: 24.7136 },
                      lng: { type: 'number', example: 46.6753 }
                    }
                  },
                  providerDay: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'provider-day-uuid' },
                      date: { type: 'string', example: '2023-01-15T00:00:00.000Z' },
                      serviceProviderId: { type: 'string', example: 'provider-uuid' }
                    }
                  },
                  dailyWorkers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        worker: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'worker-uuid' },
                            name: { type: 'string', example: 'Worker Name' }
                          }
                        }
                      }
                    }
                  },
                  invoiceItems: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'invoice-item-uuid' },
                        nameAR: { type: 'string', example: 'رسوم الخدمة' },
                        nameEN: { type: 'string', example: 'Service call fee' },
                        price: { type: 'number', example: 50.00 },
                        createdAt: { type: 'string', example: '2023-05-15T10:30:00Z' }
                      }
                    }
                  },
                  feedback: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      rating: { type: 'number', example: 4.5 },
                      review: { type: 'string', example: 'Great service!' }
                    }
                  },
                  complaint: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      description: { type: 'string', example: 'The service was not completed properly' },
                      createdAt: { type: 'string', example: '2023-01-20T14:25:00.000Z' }
                    }
                  },
                  // Optional fields that may be present in follow-up requests
                  followupService: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string', example: 'followup-service-uuid' },
                      nameAR: { type: 'string', example: 'متابعة السباكة' },
                      nameEN: { type: 'string', example: 'Plumbing Follow-up' }
                    }
                  },
                  followUpProviderDay: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string', example: 'followup-provider-day-uuid' },
                      date: { type: 'string', example: '2023-01-25T00:00:00.000Z' },
                      serviceProviderId: { type: 'string', example: 'provider-uuid' }
                    }
                  },
                  followupDailyWorkers: {
                    type: 'array',
                    nullable: true,
                    items: {
                      type: 'object',
                      properties: {
                        worker: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'worker-uuid' },
                            name: { type: 'string', example: 'Worker Name' }
                          }
                        }
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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to access this request' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getRequestById(@Param('id') id: string, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
      try {
        const data = await this.requestService.getRequestById(id, user);
        return { message: 'Request fetched', data };
      } 
      catch (err) {
        throw err;
      }
    }

    @ApiOperation({ 
      summary: 'Schedule follow-up appointment', 
      description: 'Schedule an appointment for a request with a follow-up service' 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiBody({ 
      schema: {
        type: 'object',
        properties: {
          date: { 
            type: 'string', 
            example: '15/01/2023', 
            description: 'Date for the follow-up appointment in DD/MM/YYYY format'
          }
        },
        required: ['date']
      }
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Follow-up appointment scheduled successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Follow-up appointment scheduled'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'request-uuid' },
              status: { type: 'string', example: 'PENDING_BY_SP' },
              notes: { type: 'string', example: 'Please come before noon' },
              createdAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
              service: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'service-uuid' },
                  nameAR: { type: 'string', example: 'خدمة السباكة' },
                  nameEN: { type: 'string', example: 'Plumbing Service' },
                  serviceProvider: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'provider-uuid' },
                      username: { type: 'string', example: 'serviceCompany' }
                    }
                  }
                }
              },
              followupService: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'followup-service-uuid' },
                  nameAR: { type: 'string', example: 'متابعة السباكة' },
                  nameEN: { type: 'string', example: 'Plumbing Follow-up' }
                }
              },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'customer-uuid' },
                  username: { type: 'string', example: 'customerName' }
                }
              },
              location: {
                type: 'object',
                properties: {
                  city: { type: 'string', example: 'RIYADH' },
                  fullAddress: { type: 'string', example: '123 Main St, Riyadh' },
                  miniAddress: { type: 'string', example: 'Al Olaya District' },
                  lat: { type: 'number', example: 24.7136 },
                  lng: { type: 'number', example: 46.6753 }
                }
              },
              providerDay: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'provider-day-uuid' },
                  date: { type: 'string', example: '2023-01-15T00:00:00.000Z' },
                  serviceProviderId: { type: 'string', example: 'provider-uuid' }
                }
              },
              followUpProviderDay: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'followup-provider-day-uuid' },
                  date: { type: 'string', example: '2023-01-25T00:00:00.000Z' },
                  serviceProviderId: { type: 'string', example: 'provider-uuid' }
                }
              },
              dailyWorkers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    worker: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'worker-uuid' },
                        name: { type: 'string', example: 'Worker Name' }
                      }
                    }
                  }
                }
              },
              followupDailyWorkers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    worker: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'worker-uuid' },
                        name: { type: 'string', example: 'Worker Name' }
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
    @ApiResponse({ status: 400, description: 'Bad request - Invalid date or request not in valid state' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to schedule this follow-up' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id/schedule-followup')
    async scheduleFollowupAppointment(
      @Param('id') id: string, 
      @Body() body: { date: string },
      @CurrentUser() user: GenerateTokenDto
    ): Promise<BaseResponseDto> {
      try {
        const updatedRequest = await this.requestService.scheduleFollowupAppointment(id, body.date, user.id);
        return { 
          message: 'Follow-up appointment scheduled', 
          data: updatedRequest 
        };
      } catch (err) {
        throw err;
      }
    }

    @ApiOperation({ 
      summary: 'Add invoice items', 
      description: 'Add multiple invoice items to a request. This does not override existing items but adds to them.' 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiBody({ type: AddInvoiceItemDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Invoice items added successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Invoice items added'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'request-uuid' },
              status: { type: 'string', example: 'IN_PROGRESS' },
              notes: { type: 'string', example: 'Please come before noon' },
              createdAt: { type: 'string', example: '2023-01-15T08:30:00.000Z' },
              customerId: { type: 'string', example: 'customer-uuid' },
              serviceId: { type: 'string', example: 'service-uuid' },
              locationId: { type: 'string', example: 'location-uuid' },
              providerDayId: { type: 'string', example: 'provider-day-uuid' },
              followUpProviderDayId: { 
                type: 'string', 
                example: 'followup-provider-day-uuid',
                nullable: true 
              },
              followupServiceId: { 
                type: 'string', 
                example: 'followup-service-uuid',
                nullable: true 
              },
              invoiceItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'invoice-item-uuid' },
                    nameAR: { type: 'string', example: 'رسوم الخدمة' },
                    nameEN: { type: 'string', example: 'Service call fee' },
                    price: { type: 'number', example: 50.00 },
                    createdAt: { type: 'string', example: '2023-05-15T10:30:00Z' },
                    requestId: { type: 'string', example: 'request-uuid' }
                  }
                }
              },
              service: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'service-uuid' },
                  nameAR: { type: 'string', example: 'خدمة السباكة' },
                  nameEN: { type: 'string', example: 'Plumbing Service' },
                  serviceProvider: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'provider-uuid' },
                      username: { type: 'string', example: 'serviceCompany' }
                    }
                  }
                }
              },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'customer-uuid' },
                  username: { type: 'string', example: 'customerName' }
                }
              },
              dailyWorkers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    worker: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'worker-uuid' },
                        name: { type: 'string', example: 'Worker Name' }
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
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to modify this request' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Patch(':id/invoice')
    async addInvoiceItem(@Param('id') id: string, @Body() addInvoiceItemDto: AddInvoiceItemDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
      try {
        const data = await this.requestService.addInvoiceItem(id, user.id, addInvoiceItemDto);
        return { 
          message: 'Invoice items added', 
          data 
        };
      } catch (error) {
        throw error;
      }
    }

    @ApiOperation({ 
      summary: 'Add feedback for a request', 
      description: 'Submit a rating and optional review for a completed request. Only the customer who created the request can submit feedback.' 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiBody({ type: CreateFeedbackDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Feedback submitted successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Feedback submitted successfully'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'feedback-uuid' },
              rating: { type: 'number', example: 4.5 },
              review: { type: 'string', example: 'Great service!', nullable: true },
              requestId: { type: 'string', example: 'request-uuid' },
              serviceProviderId: { type: 'string', example: 'service-provider-uuid' },
              createdAt: { type: 'string', format: 'date-time', example: '2023-01-20T14:25:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2023-01-20T14:25:00.000Z' }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Request not in completed state or feedback already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to provide feedback for this request' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(':id/feedback')
    async addFeedback(@Param('id') id: string, @Body() feedbackDto: CreateFeedbackDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
      try {
        const feedback = await this.requestService.addFeedback(id, user.id, feedbackDto);
        return {
          message: 'Feedback submitted successfully',
          data: feedback,
        };
      } 
      catch (error) {
        throw error;
      }
    }

    @ApiOperation({ 
      summary: 'Submit complaint for a request', 
      description: 'Submit a complaint for a completed or canceled request. Only the customer who created the request can submit a complaint.' 
    })
    @ApiParam({ name: 'id', description: 'Request ID', type: 'string' })
    @ApiBody({ type: CreateComplaintDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Complaint submitted successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Complaint submitted successfully'
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'complaint-uuid' },
              description: { type: 'string', example: 'The service was not completed as expected' },
              requestId: { type: 'string', example: 'request-uuid' },
              serviceProviderId: { type: 'string', example: 'service-provider-uuid' },
              createdAt: { type: 'string', format: 'date-time', example: '2023-01-20T14:25:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2023-01-20T14:25:00.000Z' }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Request not in completed state or complaint already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to submit complaint for this request' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(':id/complaint')
    async addComplaint(@Param('id') id: string, @Body() complaintDto: CreateComplaintDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
      try {
        const complaint = await this.requestService.addComplaint(id, user.id, complaintDto);
        return {
          message: 'Complaint submitted successfully',
          data: complaint,
        };
      } 
      catch (error) {
        throw error;
      }
    }
}
