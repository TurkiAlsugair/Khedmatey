import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { CreateServiceProviderDto } from "./dtos/create-serviceprovider.dto";
import { CityName, Role } from "@prisma/client";
import { AuthService } from "../auth.service";
import { UpdateServiceProviderDto } from "./dtos/update-serviceprovider.dto";

@Injectable()
export class AuthServiceProviderService {
  constructor( private prisma: DatabaseService, private twilio: TwilioService, private authService: AuthService) {}

  async signupServiceProvider({ phoneNumber, otpCode, username, usernameAR, email, cities }: CreateServiceProviderDto) {

    //check if phonenumber exists
    const existingPhoneNumber = await this.authService.findUser({phoneNumber});
    if(existingPhoneNumber) {
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
    // try {
    //   await this.twilio.verifyOtp(phoneNumber, otpCode);
    // } 
    // catch (err) {
    //   throw err;
    // }
  
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
    const newServiceProvider = await this.prisma.serviceProvider.create({
      data: { username, usernameAR, email, phoneNumber, //role column defaults to SERVICE_PROVIDER
        cities: {
          connect: matchedCities.map((city) => ({ id: city.id })),
        },
      },
    });

    const token = this.authService.generateToken(newServiceProvider) 

    return {token, newServiceProvider, cities};
  }


  async updateServiceProviderInfo( { phoneNumber, username, usernameAR, email, cities }: UpdateServiceProviderDto ) {

     // Find if the Service Provider is registered
     const serviceProvider = await this.authService.findUser({ phoneNumber });

     if (!serviceProvider)
        throw new NotFoundException(`Service Provider with phone ${phoneNumber} not found`)

     if (serviceProvider.role !== Role.SERVICE_PROVIDER)
        throw new ForbiddenException(`This phone number is not a service provider`);

    // Make the first letter of the city capital and the rest are small e.g. Riyadh
    const normalizedCities = cities.map( city => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() ) as CityName[];

    //find matching city rows and check for any invalid city inputs
    let matchedCities
    try{
      matchedCities = await this.prisma.city.findMany({
        where: { name: { in: normalizedCities } },
      });
    }
    catch(err){
      throw new BadRequestException(
        `one of the cities is not supported`
      );
    }

    // Update the Service Provider
    const updatedServiceProvider = await this.prisma.serviceProvider.update({
      where: { phoneNumber },
      data: {
        ...(username && { username }),
        ...(usernameAR && { usernameAR }),
        ...(email && { email }),
        ...(matchedCities.length > 0 && {
          cities: {
            set: matchedCities.map(city => ({ id: city.id })),
          },
        }),
      },
    });

    return updatedServiceProvider;
  }
}
