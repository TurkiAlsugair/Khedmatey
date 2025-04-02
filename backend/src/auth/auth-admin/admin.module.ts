import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TwilioModule } from 'src/twilio/twilio.module';
import { AuthModule } from '../auth.module';

@Module({
  imports: [DatabaseModule, TwilioModule, AuthModule] ,
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
