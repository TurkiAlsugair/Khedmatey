import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TwilioService } from "src/twilio/twilio.service";
import { JwtService } from "@nestjs/jwt";
import { GenerateTokenDto } from "./dtos/generate-token.dto";
import { FindUserDto } from "./dtos/find-user.dto";

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

    const newUser = user;

    const token = this.generateToken(newUser);
    return { token, newUser };
  }

  async findUser ({phoneNumber}: FindUserDto){

    // Find if the customer is registered
    // Here user is an array of one obj if user is found or empty array if not
    const [user] = (await this.prisma.$queryRaw`
      SELECT * FROM UserView WHERE phoneNumber = ${phoneNumber} LIMIT 1`) as any[]; 
    return  user || null;

  }
}
