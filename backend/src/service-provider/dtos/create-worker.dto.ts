import { CityName } from "@prisma/client";
import { IsString, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsString()
  @IsNotEmpty()
  city: CityName;
}
