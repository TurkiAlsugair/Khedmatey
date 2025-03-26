import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { GenerateTokenDto } from "../dtos/generate-token.dto";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  //the method is called only if the strategy above found a valid jwt which will then call 
  //the validate method with the decoded jwt as an object (payload)
  async validate(payload: GenerateTokenDto): Promise<GenerateTokenDto>  {
    return payload;
  }
}
