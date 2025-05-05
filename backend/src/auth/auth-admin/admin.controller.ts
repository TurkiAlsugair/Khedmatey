import { Controller, Patch, UseGuards, Param, Body, ParseIntPipe, Post, Get } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { Message } from "twilio/lib/twiml/MessagingResponse";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";

@ApiTags('auth:admin')
@Controller("auth/admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Admin signup', description: 'Register a new admin account' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Admin created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Admin created successfully'
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              example: null
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user-uuid' },
                username: { type: 'string', example: 'adminUser' },
                phoneNumber: { type: 'string', example: '+123456789' },
                role: { type: 'string', example: 'ADMIN' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post("signup")
  async signupAdmin(@Body() dto: CreateAdminDto): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.signupAdmin(dto);

      return {
        message: "Admin created successfully",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.newAdmin,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update service provider status', description: 'Change the approval status of a service provider' })
  @ApiParam({ name: 'spId', description: 'Service Provider ID', type: 'string' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Service provider status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service Provider status updated to APPROVED successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Service provider not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN) // Set meta data
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("service-providers/:spId/status")
  async updateProviderStatus(
    @Param("spId") id: string,
    @Body() data: UpdateStatusDto ): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.updateServiceProviderStatus( id, data.status );

      return {
        message: `Service Provider status updated to ${data.status} successfully `,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update service status', description: 'Change the approval status of a specific service offered by a service provider' })
  @ApiParam({ name: 'spId', description: 'Service Provider ID', type: 'string' })
  @ApiParam({ name: 'sId', description: 'Service ID', type: 'string' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Service status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service status updated to APPROVED successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'Service provider or service not found' })
  @ApiBearerAuth('JWT-auth')
  @Patch("service-providers/:spId/services/:sId/status")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateServiceStatus(
    @Param("spId") spId: string,
    @Param("sId") sId: string,
    @Body() data: UpdateStatusDto ): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.updateServiceStatus( spId, sId, data.status );

      return {
        message: `Service status updated to ${data.status} successfully `,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get pending service providers', description: 'Retrieves all service providers with PENDING status' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of pending service providers',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Pending service providers.'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'provider-uuid' },
              username: { type: 'string', example: 'serviceCompany' },
              phoneNumber: { type: 'string', example: '+123456789' },
              email: { type: 'string', example: 'service@example.com' },
              role: { type: 'string', example: 'SERVICE_PROVIDER' },
              status: { type: 'string', example: 'PENDING' },
              created_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiBearerAuth('JWT-auth')
  @Get('service-providers/status/pending')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingProviders(): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.getPendingProviders();

      if (result.length === 0) {
        return {
          message: 'No pending service providers found.',
          data: [],
        };
      }  

      return {
        message: 'Pending service providers.',
        data: result,
      };
    } catch (err) {
      throw err
    }
  }

  @ApiOperation({ summary: 'Get providers with pending services', description: 'Retrieves all service providers that have services with PENDING status' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of service providers with pending services',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service providers who have pending services.'
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'provider-uuid' },
              username: { type: 'string', example: 'serviceCompany' },
              serviceCount: { type: 'number', example: 3 },
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'service-uuid' },
                    name: { type: 'string', example: 'Plumbing Service' },
                    status: { type: 'string', example: 'PENDING' }
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
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('service-providers/services/status/pending')
  async getServiceProvidersWithPendingServices(): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.getProvidersPendingServices();

      if (result.length === 0) {
        return {
          message: 'No pending services found.',
          data: [],
        };
      }  

      return {
        message: 'Service providers who have pending services.',
        data: result,
      };
    } catch (err) {
      throw err;
    }
  }
}