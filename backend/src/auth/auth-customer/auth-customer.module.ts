import { Module } from "@nestjs/common";
import { AuthCustomerService } from "./auth-customer.service";
import { AuthCustomerController } from "./auth-customer.controller";
import { DatabaseService } from "src/database/database.service";
import { TwilioModule } from "src/twilio/twilio.module";
import { AuthModule } from "../auth.module";

@Module({
  imports: [TwilioModule, AuthModule],
  providers: [AuthCustomerService, DatabaseService],
  controllers: [AuthCustomerController],
})
export class AuthCustomerModule {}
