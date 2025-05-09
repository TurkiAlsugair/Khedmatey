import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from 'src/database/database.module';
import { CustomerModule } from 'src/customer/customer.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, CustomerModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
