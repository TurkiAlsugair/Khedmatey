import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCustomerDto {

  @ApiProperty({
    description: 'Username for the new customer',
    example: 'johnDoe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Phone number for the new customer',
    example: '+966123456789',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}



