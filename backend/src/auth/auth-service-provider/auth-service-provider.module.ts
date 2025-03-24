import { Module } from "@nestjs/common";
import { AuthServiceProviderService } from "./auth-service-provider.service";
import { AuthServiceProviderController } from "./auth-service-provider.controller";
import { TwilioModule } from "src/twilio/twilio.module";
import { AuthModule } from "../auth.module";
import { DatabaseService } from "src/database/database.service";

@Module({
  imports: [TwilioModule, AuthModule],
  providers: [AuthServiceProviderService, DatabaseService],
  controllers: [AuthServiceProviderController],
})
export class AuthServiceProviderModule {}
