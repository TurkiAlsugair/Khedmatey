import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateWorkerDto } from './dtos/create-worker.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';


@Controller('service-provider')
export class ServiceProviderController {
  constructor(private serviceProviderService: ServiceProviderService) {}

  @Roles(Role.SERVICE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('workers')
  async addWorker(@Body() dto: CreateWorkerDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> {
    try {
      const serviceProviderId = user.id;
      const worker = await this.serviceProviderService.createWorker(dto, serviceProviderId);

      return {
        message: 'Worker created successfully',
        data: worker,
      };
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard) // or remove if you want public access
  @Get()
  async getProviders(@Query('city') cityName?: string): Promise<BaseResponseDto> {
    try {
      //if 'city' query param is provided, filter by city
      if (cityName) {
        const providers = await this.serviceProviderService.findProvidersByCity(cityName);

        return {
          message: `List of providers in city: ${cityName}`,
          data: providers,
        };
      }

      //otherwise, return all providers
      const providers = await this.serviceProviderService.findAllProviders();
      return {
        message: 'List of all service providers',
        data: providers,
      };
    } catch (err) {
      throw err;
    }
  }
  
}
