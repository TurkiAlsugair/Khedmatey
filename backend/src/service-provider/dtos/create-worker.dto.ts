import { CityName } from "@prisma/client";
import { IsString, IsNotEmpty, IsPhoneNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
  @ApiProperty({
    description: 'Username for the new worker',
    example: 'workerName',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Phone number for the new worker',
    example: '+966123456789',
    required: true
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @ApiProperty({
    description: 'City where the worker operates',
    example: 'RIYADH',
    enum: CityName,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  city: CityName;
}
