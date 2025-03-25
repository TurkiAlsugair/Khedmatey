import {
  Injectable, BadRequestException, ConflictException, NotFoundException} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { CreateServiceProviderDto } from "./dtos/create-serviceprovider.dto";
import { CityName, Role } from "@prisma/client";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthServiceProviderService {
  constructor( private prisma: DatabaseService, private twilio: TwilioService, private authService: AuthService) {}

  async signupServiceProvider({ phoneNumber, otpCode, username, email, cities }: CreateServiceProviderDto) {

    const existingPhoneNumber = (await this.prisma.$queryRaw`
        SELECT * FROM UserView WHERE phoneNumber = ${phoneNumber} LIMIT 1`) as any[];

    //check for phone number
    if(existingPhoneNumber.length != 0) {
        throw new ConflictException("Phone number is already registered");
    }

    //check for email
    const existingEmail = await this.prisma.serviceProvider.findUnique({
      where: { email },
    });
    
    if (existingEmail) {
      throw new ConflictException('Email is already in use');
    }
      
    //verify otp
    try {
      await this.twilio.verifyOtp(phoneNumber, otpCode);
    } 
    catch (err) {
      throw err;
    }
  
    //find matching city rows and check for any invalid city inputs
    let matchedCities
    try{
      matchedCities = await this.prisma.city.findMany({
        where: { name: { in: cities } },
      });
    }
    catch(err){
      throw new BadRequestException(
        `one of the cities is not supported`
      );
    }

    //create service provider
    const role = Role.SERVICE_PROVIDER;
    const newServiceProvider = await this.prisma.serviceProvider.create({
      data: { username, email, phoneNumber, role,
        cities: {
          connect: matchedCities.map((city) => ({ id: city.id })),
        },
      },
    });

    const token = this.authService.generateToken( { id: newServiceProvider.id ,username, phoneNumber, role} ) 

    return {token, newServiceProvider, cities};
  }
}
