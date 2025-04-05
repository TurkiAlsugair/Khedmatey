import { Module } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [TwilioModule, DatabaseModule],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
})
export class ServiceProviderModule {}
