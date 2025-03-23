import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";
import { sendOtpDto } from "./dtos/send-otp.dto";
import { AuthService } from "./auth.service";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { LocalGuard } from "./guards/local.guard";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { signinDto } from "./dtos/signin.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("status")
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @Post("/sendOtp")
  async sendOtp(@Body() body: sendOtpDto): Promise<BaseResponseDto> {
    const phoneNumber = body.phoneNumber;

    try {
      const result = await this.authService.sendOtp(phoneNumber);

      return {
        message: "OTP sent successfully",
        data: {},
      };
    } catch (error) {
      throw error;
    }
  }

  @Post("/signin")
  async signIn(@Body() body: signinDto): Promise<BaseResponseDto> {
    
    const {phoneNumber, otpCode} = body

    try 
    {
      const result = await this.authService.signin(phoneNumber, otpCode);
      return {
        message: "Customer created successfully ",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.newUser,
        },
      };
    } 
    catch (err) {
      throw err;
    }
  }
}
