import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class signInDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;

  @IsString()
  otpCode: string;
}
