import { Injectable, Post } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class AuthService {

    constructor(private prisma: DatabaseService, private twilio: TwilioService) {}

    sendOtp(phoneNumber: string){
        return this.twilio.sendOtp(phoneNumber)
    }

    verifyOtp(phoneNumber: string, code: string){
        return this.twilio.verifyOtp(phoneNumber, code)
    }
}
