import { IsString, IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty, IsPhoneNumber } from "class-validator";
import { CityName } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateServiceProviderDto {
  @ApiProperty({
    description: 'Username for the new service provider',
    example: 'serviceCompany',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email for the service provider',
    example: 'service@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number for the service provider',
    example: '+966123456789',
    required: true
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Cities where the service provider operates',
    example: ['RIYADH', 'JEDDAH'],
    isArray: true,
    enum: CityName,
    required: true
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  cities: CityName[];

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
