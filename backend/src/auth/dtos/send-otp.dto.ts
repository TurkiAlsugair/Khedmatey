import { IsNotEmpty, IsPhoneNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class sendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP to',
    example: '+966123456789',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}
