import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';
import { CreateWorkerDto } from './dtos/create-worker.dto'
import { CityName } from '@prisma/client';


@Injectable()
export class ServiceProviderService {
    constructor( private prisma: DatabaseService, private twilio: TwilioService){}

    async createWorker(dto: CreateWorkerDto, serviceProviderId: number) {

        //check if phonenumber exists
        const existing = await this.prisma.worker.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (existing) {
          throw new ConflictException('Worker with this phone number already exists');
        }

        //verify otp
        // try {
        //   await this.twilio.verifyOtp(phoneNumber, otpCode);
        // } 
        // catch (err) {
        //   throw err;
        // }
      
        //create worker
        const worker = await this.prisma.worker.create({
          data: {
            username: dto.username,
            phoneNumber: dto.phoneNumber,
            serviceProvider: {
              connect: { id: serviceProviderId },
            },
          },
        });
      
        return worker;
    }

    async findProvidersByCity(cityNameStr: string) {
      
      //validate and get the city name by the enum
      const cityEnum = await this.parseCity(cityNameStr)
      
      //get the city:
      const city = await this.prisma.city.findUnique({
        where: {
          name: cityEnum,
        },
        include: {
          providers: true,
        },
      });
  
      //this check is needed even though it is already checked using parseCity because it is used so that city.providers works
      if (!city) {
        throw new NotFoundException(`City '${cityNameStr}' not found`);
      }
  
      //return the providers array
      return city.providers;
    }

    //helper
    async parseCity(cityNameStr: string) {
      //calidate that the string is a valid enum value
      if (!Object.values(CityName).includes(cityNameStr as CityName)) {
        throw new BadRequestException(`Invalid city: ${cityNameStr}`);
      }
      return cityNameStr as CityName;
    }
}
