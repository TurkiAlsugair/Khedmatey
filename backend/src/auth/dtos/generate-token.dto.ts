import { IsInt, IsString, IsPhoneNumber } from "class-validator";

export class GenerateTokenDto {
  @IsString()
  id: String;

  @IsString()
  username: String;

  @IsString()
  @IsPhoneNumber()
  phoneNumber: String;

  @IsString()
  role: String;
}
