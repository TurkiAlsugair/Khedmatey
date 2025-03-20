import { Module } from '@nestjs/common';
import { AuthCustomerService } from './auth-customer.service';
import { AuthCustomerController } from './auth-customer.controller';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Module({
  providers: [AuthCustomerService, DatabaseService, TwilioService],
  controllers: [AuthCustomerController]
})
export class AuthCustomerModule {}
