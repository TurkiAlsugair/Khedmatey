import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceModule } from 'src/service/service.module';

@Module({
  imports:[DatabaseModule, ServiceModule],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService]
})
export class RequestModule {}
