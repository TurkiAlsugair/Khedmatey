import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class signinDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;

  @IsString()
  otpCode: string;
}
