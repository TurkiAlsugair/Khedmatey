import { Module, forwardRef } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceModule } from 'src/service/service.module';
import { OrderStatusGateway } from 'src/sockets/order-status.gateway';
import { ServiceProviderModule } from 'src/service-provider/service-provider.module';

@Module({
  imports:[
    DatabaseModule,
    forwardRef(() => ServiceModule),
    forwardRef(() => ServiceProviderModule) //needed bacuse of the circular dependency
  ],
  controllers: [RequestController],
  providers: [RequestService, OrderStatusGateway],
  exports: [RequestService]
})
export class RequestModule {}
