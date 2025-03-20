import { Module } from '@nestjs/common';
import { AuthServiceProviderService } from './auth-service-provider.service';
import { AuthServiceProviderController } from './auth-service-provider.controller';

@Module({
  providers: [AuthServiceProviderService],
  controllers: [AuthServiceProviderController]
})
export class AuthServiceProviderModule {}
