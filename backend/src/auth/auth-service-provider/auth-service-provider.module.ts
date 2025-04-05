import { Module } from "@nestjs/common";
import { AuthServiceProviderService } from "./auth-service-provider.service";
import { AuthServiceProviderController } from "./auth-service-provider.controller";
import { TwilioModule } from "src/twilio/twilio.module";
import { AuthModule } from "../auth.module";
import { DatabaseModule } from "src/database/database.module";

@Module({
  imports: [TwilioModule, AuthModule, DatabaseModule],
  providers: [AuthServiceProviderService],
  controllers: [AuthServiceProviderController],
})
export class AuthServiceProviderModule {}
