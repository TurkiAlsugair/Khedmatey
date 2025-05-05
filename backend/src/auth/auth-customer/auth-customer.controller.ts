import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthCustomerService } from "./auth-customer.service";
import { CreateCustomerDto } from "src/auth/auth-customer/dtos/create-customer.dto";
import { Request } from "express";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { Roles } from "../decorators/roles.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "../guards/roles.guard";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { UpdateCustomerDto } from "./dtos/update-customer.dto";
import { OwnerGuard } from "../guards/owner.guard";
import { FindUserDto } from "../dtos/find-user.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";

@ApiTags('auth:customer')
@Controller("auth/customer")
export class AuthCustomerController {
  constructor(private authCustomerService: AuthCustomerService) {}

  @ApiOperation({ summary: 'Customer signup', description: 'Register a new customer account' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Customer created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer created successfully'
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
                username: { type: 'string', example: 'username' },
                phoneNumber: { type: 'string', example: '+123456789' },
                role: { type: 'string', example: 'CUSTOMER' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post("signup")
  async signup(@Body() createCustomerDto: CreateCustomerDto): Promise<BaseResponseDto> {
    try 
    {
      const result = await this.authCustomerService.signupCustomer(createCustomerDto);
      return {
        message: "Customer created successfully ",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.newCustomer,
        },
      };
    } 
    catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update customer', description: 'Update an existing customer account' })
  @ApiParam({ name: 'id', type: 'string', description: 'Customer ID' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer updated successfully'
        },
        data: {
          type: 'object',
          properties: {
            updateDto: {
              type: 'object',
              properties: {
                username: { type: 'string', example: 'updatedUsername' },
                phoneNumber: { type: 'string', example: '+123456789' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer or not the owner' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Patch(":id/account")
  async updateCustomer(@Body() updateDto: UpdateCustomerDto): Promise<BaseResponseDto> {

    try{

      // updateDto: { "phoneNumber": "...", "username": "..." }
      const result = await this.authCustomerService.updateCustomer(updateDto);
      return{
        message: "Customer updated successfully ",
        data: {updateDto}
      }
      
    }catch(err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Delete customer', description: 'Delete an existing customer account' })
  @ApiParam({ name: 'id', type: 'string', description: 'Customer ID' })
  @ApiBody({ type: FindUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer deleted successfully'
        },
        data: {
          type: 'string',
          example: '+123456789'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer or not the owner' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Delete(":id/account")
  async deleteCustomer(@Body() {phoneNumber}: FindUserDto): Promise<BaseResponseDto>{
    
    try{

      const result = await this.authCustomerService.deleteCustomer({phoneNumber})
      return{
        message: "Customer deleted successfully ",
        data: phoneNumber
      }

    }catch(err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Get customer status', description: 'Returns the current authenticated customer information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer information returned successfully',
    schema: {
      example: {
        id: 'user-uuid',
        username: 'username',
        phoneNumber: '+123456789',
        role: 'CUSTOMER'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard )
  @Get("status")
  status(@Req() req: Request) {
    return req.user;
  }

}
