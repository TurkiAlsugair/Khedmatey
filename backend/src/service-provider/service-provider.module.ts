import { Module, forwardRef } from '@nestjs/common';
import { ServiceProviderController } from './service-provider.controller';
import { ServiceProviderService } from './service-provider.service';
import { DatabaseModule } from 'src/database/database.module';
import { TwilioModule } from 'src/twilio/twilio.module';
import { RequestModule } from 'src/request/request.module';
import { ServiceModule } from 'src/service/service.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    DatabaseModule,
    TwilioModule,
    forwardRef(() => RequestModule), //needed bacuse of the circular dependency
    forwardRef(() => ServiceModule),
    AuthModule
  ],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
  exports: [ServiceProviderService]
})
export class ServiceProviderModule {}
