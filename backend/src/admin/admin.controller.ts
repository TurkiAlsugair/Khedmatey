import { Controller, Delete, Get, Patch, Param, Query, UseGuards, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { BlacklistCustomerDto } from './dto/blacklist-customer.dto';
import { LookupUserDto } from './dto/lookup-user.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @ApiOperation({
    summary: 'Look up users',
    description: 'Find users by phone number or get all blacklisted/non-blacklisted customers:\n\
    - If phoneNumber is provided: Returns that specific user (blacklisted parameter is ignored)\n\
    - If phoneNumber is not provided: Returns all customers with the specified blacklist status'
  })
  @ApiQuery({ name: 'phoneNumber', description: 'User phone number', type: 'string', required: false })
  @ApiQuery({ name: 'blacklisted', description: 'Filter customers by blacklist status', type: 'boolean', required: false })
  @ApiResponse({
    status: 200,
    description: 'User(s) information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Users retrieved successfully' },
        data: {
          oneOf: [
            {
              // Single user response
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user-uuid' },
                username: { type: 'string', example: 'username' },
                phoneNumber: { type: 'string', example: '+123456789' },
                role: { type: 'string', example: 'CUSTOMER' },
                blacklisted: { type: 'boolean', example: false },
                createdAt: { type: 'string', format: 'date-time' }
              }
            },
            {
              // Multiple users response
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'user-uuid' },
                  username: { type: 'string', example: 'username' },
                  phoneNumber: { type: 'string', example: '+123456789' },
                  role: { type: 'string', example: 'CUSTOMER' },
                  blacklisted: { type: 'boolean', example: false },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - No parameters provided' })
  @ApiResponse({ status: 404, description: 'User(s) not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users/lookup')
  async lookupUser(@Query() query: LookupUserDto) {
    const result = await this.adminService.lookUpUsers(query.phoneNumber, query.blacklisted);
    
    if (query.phoneNumber) {
      const userRole = result.role;
      
      if (userRole === Role.CUSTOMER) {
        return {
          message: "Customer data with requests retrieved successfully",
          data: result
        };
      } else if (userRole === Role.SERVICE_PROVIDER) {
        return {
          message: "Service provider data retrieved successfully",
          data: result
        };
      } else {
        return {
          message: "User information retrieved successfully",
          data: result
        };
      }
    } else if (query.blacklisted !== undefined) {
      return {
        message: `${result.length} ${query.blacklisted ? 'blacklisted' : 'non-blacklisted'} customers retrieved successfully`,
        data: result
      };
    }
  }

  @ApiOperation({ summary: 'Blacklist a customer', description: 'Update a customer\'s blacklist status and cancel unpaid requests if blacklisting' })
  @ApiResponse({
    status: 200,
    description: 'Customer blacklist status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Customer blacklisted successfully' },
        canceledRequests: { type: 'number', example: 3 },
        customerStatus: { type: 'string', example: 'blacklisted' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('users/blacklist')
  async blacklistCustomer(@Body() blacklistDto: BlacklistCustomerDto): Promise<BaseResponseDto> {
    const result = await this.adminService.blacklistUser(
      blacklistDto.userId,
      blacklistDto.isBlacklisted,
      blacklistDto.role
    );
    try{
      return {
        message: `${blacklistDto.role} ${blacklistDto.isBlacklisted ? 'blacklisted' : 'removed from blacklist'} successfully`,
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete user', description: 'Delete a user account based on their role' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':role/:id')
  async deleteUser(
    @Param('role') role: Role, @Param('id') id: string
  ): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.deleteUser(id, role);
      return {
        message: `${result.role === Role.CUSTOMER ? 'Customer' : 'Service provider'} with ID ${result.id} deleted successfully`
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ 
    summary: 'Get all complaints', 
    description: 'Retrieves all complaints submitted for all service providers' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Complaints retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Complaints retrieved successfully' },
        data: { 
          type: 'array', 
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'complaint-uuid' },
              description: { type: 'string', example: 'Worker arrived late and was unprofessional' },
              createdAt: { type: 'string', format: 'date-time' },
              serviceProvider: { 
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  phoneNumber: { type: 'string' }
                }
              },
              request: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  customer: { type: 'object' }
                }
              }
            }
          }
        },
        count: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to access complaints' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('complaints')
  async getAllComplaints(): Promise<BaseResponseDto> {
    return this.adminService.getAllComplaints();
  }

  @ApiOperation({
    summary: 'Get all unhandled requests',
    description: 'Returns all unhandled requests (PENDING, CANCELED) for all customers'
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('requests/unhandled')
  async getAllUnhandledRequests(): Promise<BaseResponseDto> {
    const requests = await this.adminService.getAllUnhandledRequests();
    
    return {
      message: "Unhandled Requests Fetched Successfully",
      data: requests || []
    };
  }

  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Returns platform statistics including counts of service providers, customers, services, requests, and workers'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Dashboard statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            serviceProviders: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 50 },
                byStatus: {
                  type: 'object',
                  example: { PENDING: 5, ACCEPTED: 45 }
                }
              }
            },
            customers: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 100 }
              }
            },
            services: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 200 },
                byStatus: {
                  type: 'object',
                  example: { PENDING: 20, ACCEPTED: 180 }
                }
              }
            },
            requests: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 300 },
                byStatus: {
                  type: 'object',
                  example: { PENDING: 30, ACCEPTED: 100, FINISHED: 170 }
                }
              }
            },
            workers: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 150 }
              }
            }
          }
        }
      }
    }
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard/stats')
  async getDashboardStats(): Promise<any> {
    const stats = await this.adminService.getDashboardStats();
    return {
      message: "Dashboard statistics retrieved successfully",
      data: stats
    };
  }
}
