import { IsString, IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty, IsPhoneNumber } from "class-validator";
import { CityName } from "@prisma/client";

export class CreateServiceProviderDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  cities: CityName[];

  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
