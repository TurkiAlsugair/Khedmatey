import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class sendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}
