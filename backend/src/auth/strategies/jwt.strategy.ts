import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { GenerateTokenDto } from "../dtos/generate-token.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "ahyebF10hdbQd689Ljfd",
    });
  }

  async validate(payload: GenerateTokenDto) {
    return payload;
  }
}
