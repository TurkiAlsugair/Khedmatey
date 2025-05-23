import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";

//This guard verifies the otp and assigns the user to the request object

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "phoneNumber", passwordField: "otpCode" });
  }

  validate(phoneNumber: string, code: string) {
    const user = this.authService.signin(phoneNumber, code);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
