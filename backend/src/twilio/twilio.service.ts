import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { Twilio } from 'twilio'

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
      this.twilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendOtp(phoneNumber: string) {
      const serviceSid = this.configService.get(
          'TWILIO_VERIFICATION_SERVICE_SID',
        );

      try{
          const response = await this.twilioClient.verify.v2
          .services(serviceSid).verifications.create({to: phoneNumber, channel: 'sms' })

          return response
      }
      catch(err){
        throw new BadRequestException({
          message: 'Failed to send OTP via Twilio',
          error: err
        });
      }
      
  }

  async verifyOtp(phoneNumber: string, code: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );

    try 
    {
      const response = await this.twilioClient.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phoneNumber, code });
      
      
      //check if verification was successful
      if (response.valid) {
        return response
      }
      else{
        throw new BadRequestException({
          message: 'Invalid OTP code or expired',
          error: 'Verification Failed',
        });
      }
    } 
    catch (err) 
    {
      throw err
    }
  }
}
