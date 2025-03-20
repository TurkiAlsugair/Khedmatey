import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [DatabaseModule, TwilioModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
