import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { AuthCustomerModule } from './auth/auth-customer/auth-customer.module';
import { AuthServiceProviderModule } from './auth/auth-service-provider/auth-service-provider.module';
import { ServiceModule } from './service/service.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { AdminModule } from './auth/auth-admin/admin.module';
import { SearchModule } from './search/search.module';
import { RequestModule } from './request/request.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}), 
    AuthModule, 
    CustomerModule, 
    AuthCustomerModule, 
    AuthServiceProviderModule, 
    ServiceModule, 
    ServiceProviderModule,
    ServiceModule,
    AdminModule,
    SearchModule,
    RequestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
