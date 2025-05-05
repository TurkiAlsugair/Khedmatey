import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class signinDto {
  @ApiProperty({
    description: 'Phone number used during registration',
    example: '+966123456789',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
    required: true
  })
  @IsString()
  otpCode: string;
}
