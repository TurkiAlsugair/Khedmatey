import { Body, Controller, Get, Post, Patch, UseGuards, Req } from '@nestjs/common';
import { CreateServiceProviderDto } from './dtos/create-serviceprovider.dto';
import { AuthServiceProviderService } from './auth-service-provider.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { Request } from "express";
import { OwnerGuard } from '../guards/owner.guard';
import { UpdateServiceProviderDto } from './dtos/update-serviceprovider.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";

@ApiTags('auth:service-provider')
@Controller('auth/service-provider')
export class AuthServiceProviderController {
    constructor(private service: AuthServiceProviderService) {}

  @ApiOperation({ summary: 'Service provider signup', description: 'Register a new service provider account' })
  @ApiBody({ type: CreateServiceProviderDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Service provider created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service provider created successfully'
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
                email: { type: 'string', example: 'provider@example.com' },
                role: { type: 'string', example: 'SERVICE_PROVIDER' },
                cities: { 
                  type: 'array', 
                  items: { 
                    type: 'string' 
                  },
                  example: ['RIYADH', 'JEDDAH']
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signup')
  async signupServiceProvider(@Body() dto: CreateServiceProviderDto): Promise<BaseResponseDto> {
    try {
      const result = await this.service.signupServiceProvider(dto);
      return {
        message: 'Service provider created successfully',
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: {...result.newServiceProvider, cities: result.cities },
        },
      };
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update service provider', description: 'Update an existing service provider account' })
  @ApiParam({ name: 'id', type: 'string', description: 'Service Provider ID' })
  @ApiBody({ type: UpdateServiceProviderDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Service provider updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Service Provider updated successfully'
        },
        data: {
          type: 'object',
          properties: {
            updateDto: {
              type: 'object',
              properties: {
                username: { type: 'string', example: 'updatedUsername' },
                phoneNumber: { type: 'string', example: '+123456789' },
                email: { type: 'string', example: 'updated@example.com' },
                cities: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['RIYADH', 'JEDDAH', 'DAMMAM']
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider or not the owner' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER) //set metadata
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Patch(":id/account")
  async updateServiceProvider(@Body() updateDto: UpdateServiceProviderDto): Promise<BaseResponseDto> {

    try{

      // updateDto: { "phoneNumber": "...", "username": "..." }
      const result = await this.service.updateServiceProviderInfo(updateDto);
      return{
        message: "Service Provider updated successfully ",
        data: {updateDto}
      }
      
    }catch(err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Get service provider status', description: 'Returns the current authenticated service provider information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service provider information returned successfully',
    schema: {
      example: {
        id: 'user-uuid',
        username: 'username',
        phoneNumber: '+123456789',
        email: 'provider@example.com',
        role: 'SERVICE_PROVIDER',
        cities: ['RIYADH', 'JEDDAH']
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a service provider' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SERVICE_PROVIDER) //set metadata
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get("status")
  status(@Req() req: Request) {
    return req.user;
  }
}
