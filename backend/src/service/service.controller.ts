import { Controller, Get, Post, Body, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createService(@Body() dto: any, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    const serviceProviderId = user.id
    console.log(serviceProviderId)
    try {
      // const newService = await this.serviceService.create(dto);
      const newService = ""
      return {
        message: 'Service created successfully',
        data: newService,
      };
    } 
    catch (err) {
      throw err;
    }
  }
  
  @Get()
  findAll() {
    // return this.serviceService.findAll();
  }

}
