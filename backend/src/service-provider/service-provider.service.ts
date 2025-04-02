import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';
import { CreateWorkerDto } from './dtos/create-worker.dto'


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
}
