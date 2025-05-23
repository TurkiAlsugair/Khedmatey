import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { AuthCustomerModule } from './auth/auth-customer/auth-customer.module';
import { AuthServiceProviderModule } from './auth/auth-service-provider/auth-service-provider.module';
import { AuthAdminModule } from './auth/auth-admin/auth-admin.module';
import { ServiceModule } from './service/service.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { SearchModule } from './search/search.module';
import { RequestModule } from './request/request.module';
import { OrderStatusGateway } from './sockets/order-status.gateway';
import { AdminModule } from './admin/admin.module';
import { TwilioModule } from './twilio/twilio.module';
import { FollowupServiceModule } from './followup-service/followup-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    AuthModule, 
    CustomerModule, 
    AuthCustomerModule, 
    AuthServiceProviderModule, 
    ServiceModule, 
    ServiceProviderModule,
    ServiceModule,
    AuthAdminModule,
    AdminModule,
    SearchModule,
    RequestModule,
    TwilioModule,
    FollowupServiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
