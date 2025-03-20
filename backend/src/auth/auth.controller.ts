import { Body, Controller, Post } from '@nestjs/common';
import { sendOtpDto } from './dtos/send-otp.dto';
import { AuthService } from './auth.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/sendOtp')
    async sendOtp(@Body() body: sendOtpDto): Promise<BaseResponseDto> {
        const phoneNumber = body.phoneNumber

        try{
            const result = await this.authService.sendOtp(phoneNumber)

            return {
                message: 'OTP sent successfully',
                data: {},
              };
        }
        catch(error){
            throw error; 
        }
    }

    @Post("/verifyOtp")
    async verifyOtp(@Body() body){ //temp route for testing, no need for dto right now
        try{
            const result = await this.authService.verifyOtp(body.phoneNumber, body.code)
            
            return {
                message: 'Verified Successfully',
                data: result,
              };
        }
        catch(error){
            throw error; 
        }
    }
}
