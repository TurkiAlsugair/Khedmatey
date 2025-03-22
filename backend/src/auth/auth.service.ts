import { Injectable, Post, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { JwtService } from "@nestjs/jwt";
import { GenerateTokenDto } from "./dtos/generate-token.dto";

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

  async signIn(userPhoneNumber: string, code: string) {
    console.log("here signin");
    const user = (await this.prisma.$queryRaw`
        SELECT * FROM UserView WHERE phoneNumber = ${userPhoneNumber} LIMIT 1`) as any[];

    if (!user || user.length === 0) {
      throw new UnauthorizedException("User not found");
    }

    const isVerified = this.twilio.verifyOtp(userPhoneNumber, code);

    if (!isVerified) {
      throw new UnauthorizedException("Wrong OTP");
    }

    const newUser = user[0];

    const token = this.generateToken(newUser);
    return { token, newUser };
  }
}
