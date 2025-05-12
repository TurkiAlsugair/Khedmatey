import { forwardRef, Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceProviderModule } from 'src/service-provider/service-provider.module';

@Module({
  imports:[DatabaseModule, forwardRef(() => ServiceProviderModule)],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService]
})
export class ServiceModule {}
