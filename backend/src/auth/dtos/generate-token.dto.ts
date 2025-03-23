import { IsInt, IsString, IsPhoneNumber } from "class-validator";

export class GenerateTokenDto {
  @IsString()
  id: number;

  @IsString()
  username: String;

  @IsString()
  @IsPhoneNumber()
  phoneNumber: String;

  @IsString()
  role: String;
}
