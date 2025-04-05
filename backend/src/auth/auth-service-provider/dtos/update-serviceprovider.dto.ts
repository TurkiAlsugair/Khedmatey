import { IsString, IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty, IsPhoneNumber, IsOptional } from "class-validator";
import { CityName } from "@prisma/client";

export class UpdateServiceProviderDto {

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
}
