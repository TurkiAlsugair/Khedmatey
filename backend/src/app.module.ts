import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { AuthCustomerModule } from './auth/auth-customer/auth-customer.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}), AuthModule, CustomerModule, AuthCustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
