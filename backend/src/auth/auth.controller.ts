import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";
import { sendOtpDto } from "./dtos/send-otp.dto";
import { AuthService } from "./auth.service";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { signInDto } from "./dtos/signIn.dto";
import { LocalGuard } from "./guards/local.guard";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("status")
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    console.log("Inside auth status");
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

  @Post("/signin/verifyOTP")
  @UseGuards(LocalGuard)
  signIne(@Req() req: Request) {
    return req.user;
  }
}
