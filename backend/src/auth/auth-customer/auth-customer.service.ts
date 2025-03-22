import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { TwilioService } from "src/twilio/twilio.service";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthCustomerService {
  constructor(
    private prisma: DatabaseService,
    private twilio: TwilioService,
    private authService: AuthService
  ) {}

  async signupCustomer({ phoneNumber, username, otpCode }: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { phoneNumber },
    });

    if (existingCustomer) {
      throw new UnauthorizedException("Phone number is already registered");
    }

    try{
      await this.twilio.verifyOtp(phoneNumber, otpCode);
    }
    //error is thrown from the twilio service meaning invalid otp or something else went wrong
    catch(err){
      throw err
    }

    const role = "customer";
    const newCustomer = await this.prisma.customer.create({
      data: { phoneNumber, username, role },
    });

    const token = this.authService.generateToken(newCustomer);
    return { token, newCustomer };
  }
}
