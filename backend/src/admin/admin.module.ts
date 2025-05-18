import { Module} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from 'src/database/database.module';
import { CustomerModule } from 'src/customer/customer.module';
import { AuthModule } from 'src/auth/auth.module';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports: [
    DatabaseModule, 
    CustomerModule, 
    AuthModule, 
    RequestModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
