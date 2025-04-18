import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";
import { sendOtpDto } from "./dtos/send-otp.dto";
import { AuthService } from "./auth.service";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { signinDto } from "./dtos/signIn.dto";

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
    const { phoneNumber, otpCode } = body;

    try {
      const result = await this.authService.signin(phoneNumber, otpCode);
      return {
        message: "Signed in successfully ",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.user,
        },
      };
    } catch (err) {
      throw err;
    }
  }
}
