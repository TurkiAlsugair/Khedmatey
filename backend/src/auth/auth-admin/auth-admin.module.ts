import { Module } from '@nestjs/common';
import { AuthAdminController } from './auth-admin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TwilioModule } from 'src/twilio/twilio.module';
import { AuthModule } from '../auth.module';
import { AuthAdminService } from './auth-admin.service';

@Module({
  imports: [DatabaseModule, TwilioModule, AuthModule] ,
  providers: [AuthAdminService],
  controllers: [AuthAdminController]
})
export class AuthAdminModule {}
