import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceModule } from 'src/service/service.module';

@Module({
  imports: [DatabaseModule, ServiceModule],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
