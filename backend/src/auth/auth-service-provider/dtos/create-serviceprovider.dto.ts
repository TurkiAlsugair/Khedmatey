import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  ArrayNotEmpty,
  IsPhoneNumber,
} from "class-validator";

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
  cities: string[];

  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
