import { Module } from '@nestjs/common';
import { FollowupServiceController } from './followup-service.controller';
import { FollowupServiceService } from './followup-service.service';
import { DatabaseModule } from 'src/database/database.module';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports: [DatabaseModule, RequestModule],
  controllers: [FollowupServiceController],
  providers: [FollowupServiceService],
  exports: [FollowupServiceService]
})
export class FollowupServiceModule {} 