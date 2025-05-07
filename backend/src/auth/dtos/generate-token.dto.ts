import { Role } from "@prisma/client";
import { IsInt, IsString, IsPhoneNumber } from "class-validator";

export class GenerateTokenDto {
  @IsString()
  id: string;

  @IsString()
  username: String;

  @IsString()
  @IsPhoneNumber()
  phoneNumber: String;

  @IsString()
  role: Role;
}
