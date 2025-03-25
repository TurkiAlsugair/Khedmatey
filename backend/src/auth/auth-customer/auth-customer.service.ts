import {
  ConflictException, Injectable, UnauthorizedException, BadRequestException} from "@nestjs/common";
import { Role } from "@prisma/client";
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
    const existingCustomer = (await this.prisma.$queryRaw`
      SELECT * FROM UserView WHERE phoneNumber = ${phoneNumber} LIMIT 1`) as any[];

    if (existingCustomer.length != 0 ) {
      throw new ConflictException("Phone number is already registered");
    }

    try {
      await this.twilio.verifyOtp(phoneNumber, otpCode);
    } catch (err) {
        throw new BadRequestException("Wrong OTP");
    }

    const role = Role.CUSTOMER;
    const newCustomer = await this.prisma.customer.create({
      data: { phoneNumber, username, role },
    });

    const token = this.authService.generateToken(newCustomer);
    return { token, newCustomer };
  }
}
