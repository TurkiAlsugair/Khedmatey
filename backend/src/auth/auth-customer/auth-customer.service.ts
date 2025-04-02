import { ConflictException, Injectable,NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { TwilioService } from "src/twilio/twilio.service";
import { AuthService } from "../auth.service";
import { UpdateCustomerDto } from "./dtos/update-customer.dto";
import { FindUserDto } from "../dtos/find-user.dto";


@Injectable()
export class AuthCustomerService {
  constructor( private prisma: DatabaseService, private twilio: TwilioService, private authService: AuthService ) {}

  async signupCustomer({ phoneNumber, username, otpCode }: CreateCustomerDto) {
    const existingCustomer = await this.authService.findUser({ phoneNumber });

    if (existingCustomer) {
      throw new ConflictException("Phone number is already registered");
    }

    try {
      // await this.twilio.verifyOtp(phoneNumber, otpCode);
    } catch (err) {
        throw new BadRequestException("Wrong OTP");
    }


    const role = Role.CUSTOMER;
    const newCustomer = await this.prisma.customer.create({
      data: { phoneNumber, username}, //role column defaults to CUSTOMER
    });

    const token = this.authService.generateToken(newCustomer);
    return { token, newCustomer };
  }

  async updateCustomer( {phoneNumber, username}: UpdateCustomerDto ){

    // Find if the customer is registered
    const updateCustomer = await this.authService.findUser({ phoneNumber });

    if (!updateCustomer)
      throw new NotFoundException(`Customer with phone ${phoneNumber} not found`)

    if (updateCustomer.role !== Role.CUSTOMER)
      throw new ForbiddenException("This phone number is not a customer")

    // if the customer is registered, then update the information
      await this.prisma.customer.update({

      where: {phoneNumber},
      data: {username}
    });
  }

  async deleteCustomer({ phoneNumber }: FindUserDto) {
  
    const user = await this.authService.findUser({ phoneNumber }) ;
    
    if (!user) 
      throw new NotFoundException(`User with phone ${phoneNumber} not found`);

    if (user.role !== Role.CUSTOMER)
      throw new ForbiddenException(`This phone number is not a customer`);
  
  
    await this.prisma.customer.delete({
      where: { phoneNumber },
    });
  
    return { message: 'Customer deleted successfully' };
  }
}
