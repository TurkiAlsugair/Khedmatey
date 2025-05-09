import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthCustomerService } from "./auth-customer.service";
import { CreateCustomerDto } from "src/auth/auth-customer/dtos/create-customer.dto";
import { Request } from "express";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { Roles } from "../decorators/roles.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "../guards/roles.guard";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { OwnerGuard } from "../guards/owner.guard";
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
