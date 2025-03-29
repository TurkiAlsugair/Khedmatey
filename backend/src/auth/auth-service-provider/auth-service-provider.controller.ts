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

@Controller('auth/serviceProvider')
export class AuthServiceProviderController {
    constructor(private service: AuthServiceProviderService) {}

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

  @Roles(Role.SERVICE_PROVIDER) //set metadata
    @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
    @Patch("/account")
    async updateCustomer(@Body() updateDto: UpdateServiceProviderDto, @Req() req: Request): Promise<BaseResponseDto> {
  
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

  @Roles(Role.SERVICE_PROVIDER) //set metadata
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get("status")
  status(@Req() req: Request) {
    return req.user;
  }

}
