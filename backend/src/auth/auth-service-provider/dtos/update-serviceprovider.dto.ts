import { IsString, IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty, IsPhoneNumber, IsOptional } from "class-validator";
import { CityName } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateServiceProviderDto {

  @ApiProperty({
    description: 'Updated username for the service provider',
    example: 'updatedServiceCompany',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Updated email for the service provider',
    example: 'updated@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Current phone number for the service provider',
    example: '+966123456789',
    required: true
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Updated cities where the service provider operates',
    example: ['RIYADH', 'JEDDAH', 'DAMMAM'],
    isArray: true,
    enum: CityName,
    required: true
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  cities: CityName[];
}
