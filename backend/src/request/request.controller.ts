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
              serviceId: { type: 'string', example: 'service-uuid' },
              customerId: { type: 'string', example: 'customer-uuid' },
              notes: { type: 'string', example: 'Please come before noon' },
              status: { type: 'string', example: 'PENDING' },
              date: { type: 'string', example: '2023-01-15' },
              location: {
                type: 'object',
                properties: {
                  city: { type: 'string', example: 'RIYADH' },
                  fullAddress: { type: 'string', example: '123 Main St, Riyadh' },
                  miniAddress: { type: 'string', example: 'Al Olaya District' },
                  lat: { type: 'number', example: 24.7136 },
                  lng: { type: 'number', example: 46.6753 }
                }
              }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
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

    @ApiOperation({ summary: 'Update request status', description: 'Update the status of a service request' })
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
              serviceId: { type: 'string', example: 'service-uuid' },
              customerId: { type: 'string', example: 'customer-uuid' },
              status: { type: 'string', example: 'ACCEPTED' }
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

    @ApiOperation({ summary: 'Get requests', description: 'Get a list of service requests related to the authenticated user, optionally filtered by status' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter requests by status', enum: Status })
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
                id: { type: 'string', example: 'request-uuid' },
                serviceId: { type: 'string', example: 'service-uuid' },
                customerId: { type: 'string', example: 'customer-uuid' },
                notes: { type: 'string', example: 'Please come before noon' },
                status: { type: 'string', example: 'PENDING' },
                date: { type: 'string', example: '2023-01-15' },
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
                    fullAddress: { type: 'string', example: '123 Main St, Riyadh' }
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
    async getRequests(@CurrentUser() user: GenerateTokenDto, @Query('status') status?: Status): Promise<BaseResponseDto> {
      try
      {
        const data = await this.requestService.getRequests(user, status);
        return { message: 'Requests fetched', data };
      }
      catch(err){
        throw err
      }
    }
}
