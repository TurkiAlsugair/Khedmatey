import { Body, Controller, Post, Delete, Param } from '@nestjs/common';
import { CreateServiceProviderDto } from './dtos/create-serviceprovider.dto';
import { AuthService } from '../auth.service';
import { AuthServiceProviderService } from './auth-service-provider.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';

@Controller('auth-service-provider')
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


}
