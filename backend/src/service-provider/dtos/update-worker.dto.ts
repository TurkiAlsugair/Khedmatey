import { CityName } from "@prisma/client";
import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkerDto {
  @ApiProperty({
    description: 'Username for the worker',
    example: 'workerName',
    required: false
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Phone number for the worker',
    example: '+966123456789',
    required: false
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'City where the worker operates',
    example: 'RIYADH',
    enum: CityName,
    required: false
  })
  @IsString()
  @IsOptional()
  city?: CityName;
} 