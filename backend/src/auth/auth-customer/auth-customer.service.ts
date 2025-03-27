import {
  ConflictException, Injectable,NotFoundException, BadRequestException} from "@nestjs/common";
import { Role } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { TwilioService } from "src/twilio/twilio.service";
import { AuthService } from "../auth.service";
import { UpdateCustomerDto } from "./dtos/update-customer.dto";
import { FindUserDto } from "./dtos/find-user.dto";


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
      // await this.twilio.verifyOtp(phoneNumber, otpCode);
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

  async findUser ({phoneNumber}: FindUserDto){

    // Find if the customer is registered
    const customer = await this.prisma.customer.findUnique({
      where: {phoneNumber}
    })

    if (!customer)
      throw new NotFoundException(`Customer with phone ${phoneNumber} not found`)

    return customer

  }

  async updateCustomer( {phoneNumber, username}: UpdateCustomerDto ){

    // Find if the customer is registered
    let updateCustomer = await this.findUser( {phoneNumber} )

    if (!updateCustomer)
      throw new NotFoundException(`Customer with phone ${phoneNumber} not found`)

    // if the customer is registered, then update the information
    updateCustomer = await this.prisma.customer.update({

      where: {phoneNumber},
      data: {username}
    })
  }

}
