import {
  Injectable, BadRequestException, ConflictException, NotFoundException} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { CreateServiceProviderDto } from "./dtos/create-serviceprovider.dto";
import { Role } from "@prisma/client";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthServiceProviderService {
  constructor( private prisma: DatabaseService, private twilio: TwilioService, private authService: AuthService) {}

  async signupServiceProvider({ phoneNumber, otpCode, username, email, cities }: CreateServiceProviderDto) {

    const existingPhoneNumber = (await this.prisma.$queryRaw`
        SELECT * FROM UserView WHERE phoneNumber = ${phoneNumber} LIMIT 1`) as any[];

    if (existingPhoneNumber.length != 0) {
          throw new ConflictException("Phone number is already registered");
        }

        const existingEmail = await this.prisma.serviceProvider.findUnique({
          where: { email },
        });
        
        if (existingEmail) {
          throw new ConflictException('Email is already in use');
        }
        

        try {
          await this.twilio.verifyOtp(phoneNumber, otpCode);
          } catch (err) {
            throw new BadRequestException("Wrong OTP");
          }

    cities = cities.map((city) => city.toLowerCase());

    const matchedCities = await this.prisma.city.findMany({
      where: { name: { in: cities } },
      });
      
     // Compare retrieved names from DB with entered names
     const matchedNames = matchedCities.map((c) => c.name);
   

    // Compare with user input
    const invalidCities = cities.filter((city) => !matchedNames.includes(city));

    
    if (invalidCities.length > 0) {
      throw new BadRequestException(
        `Sorry, the following cities are not supported: ${invalidCities.join(', ')}`
      );
    }
        
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
