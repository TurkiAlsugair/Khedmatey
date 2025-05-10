import { Controller, Delete, Get, Patch, Param, Query, UseGuards, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { FindUserDto } from 'src/dtos/find-user.dto';
import { BlacklistCustomerDto } from './dto/blacklist-customer.dto';
import { LookupUserDto } from './dto/lookup-user.dto';
import { AllUnhandledRequestsResponseDto } from './dto/unhandled-requests.dto';

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
    description: 'User(s) information retrieved successfully'
  })
  @ApiResponse({ status: 400, description: 'Bad request - No parameters provided' })
  @ApiResponse({ status: 404, description: 'User(s) not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users/lookup')
  async lookupUser(@Query() query: LookupUserDto) {
    return this.adminService.lookUpUsers(query.phoneNumber, query.blacklisted);
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
  @Patch('customers/blacklist')
  async blacklistCustomer(@Body() blacklistDto: BlacklistCustomerDto) {
    return this.adminService.blacklistCustomer(
      blacklistDto.customerId,
      blacklistDto.blacklist
    );
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
      return result;
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
    description: 'Returns all unhandled requests (PENDING, PENDING_BY_SP, CANCELED) for all customers, grouped by service provider'
  })
  @ApiResponse({
    status: 200,
    description: 'All unhandled requests retrieved successfully',
    type: AllUnhandledRequestsResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('requests/unhandled')
  async getAllUnhandledRequests(): Promise<AllUnhandledRequestsResponseDto> {
    return this.adminService.getAllUnhandledRequests();
  }
}
