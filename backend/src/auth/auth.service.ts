import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { JwtService } from "@nestjs/jwt";
import { GenerateTokenDto } from "./dtos/generate-token.dto";
import { FindUserDto } from "../dtos/find-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private twilio: TwilioService,
    private jwt: JwtService
  ) {}

  sendOtp(phoneNumber: string) {
    return this.twilio.sendOtp(phoneNumber);
  }

  generateToken(user: GenerateTokenDto) {
    const payload = {
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return this.jwt.sign(payload);
  }

  async signin(userPhoneNumber: string, code: string) {
    const user = await this.findUser({phoneNumber: userPhoneNumber})

    if (!user) {
      throw new NotFoundException("User not found");
    }

    //verify otp
    // try {
    //   await this.twilio.verifyOtp(userPhoneNumber, code);
    //   } catch (err) {
    //     throw new BadRequestException("Wrong OTP");
    //   }

    //check if customer is blacklisted
    if (user.role === 'CUSTOMER') {
      const customer = await this.checkBlacklist(user.id);
      if (customer && customer.isBlacklisted) {
        throw new ForbiddenException('Sorry, your account has been suspended.');
      }
    }

    let userWithCities = user;
    
    //if role is SP, include service provider's cities and email in user object
    if (user.role === 'SERVICE_PROVIDER') 
    {
      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: user.id },
        include: { cities: true },
      });

      //this will never enter but it is needed so that acceccing cities does not give 'serviceProvider is possibly null' error
      if (!serviceProvider) {
        throw new NotFoundException('Service provider record not found');
      }

      //map city objects to just their `name`
      const cityNames = serviceProvider.cities.map((c) => c.name);

      //merge original user data with the city names array
      userWithCities = {
        ...user,
        cities: cityNames,
      };
    }

    //if role is worker, include worker's city in user object
    else if(user.role === 'WORKER')
    {
      const worker = await this.prisma.worker.findUnique({
        where: { id: user.id },
        include: { city: true },
      });

      //this will never enter but it is needed so that acceccing the city does not give 'worker is possibly null' error
      if (!worker) {
        throw new NotFoundException('Service provider record not found');
      }

      //map city objects to just their `name`
      const cityName = worker.city.name

      //merge original user data with the city names array
      userWithCities = {
        ...user,
        city: cityName,
      };
    }

    const token = this.generateToken(userWithCities);

    return { token, user: userWithCities };

  }

  async findUser ({phoneNumber}: FindUserDto){

    // Find if the customer is registered
    // Here user is an array of one obj if user is found or empty array if not
    const [user] = (await this.prisma.$queryRaw`
      SELECT * FROM UserView WHERE phoneNumber = ${phoneNumber} LIMIT 1`) as any[]; 
    return  user || null;

  }

  async checkBlacklist(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { isBlacklisted: true }
    });
    
    return customer;
  }
}
