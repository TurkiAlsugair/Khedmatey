import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsLatitude,
    IsLongitude,
  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// !: hush the compiler
export class LocationDto {
  @ApiProperty({
    description: 'City name where the service is requested',
    example: 'RIYADH',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  city!: string;

  @ApiProperty({
    description: 'Complete address details',
    example: '123 Main St, Al Olaya, Riyadh 12345',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  fullAddress!: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 24.7136,
    required: true
  })
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 46.6753,
    required: true
  })
  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @ApiProperty({
    description: 'Short/abbreviated address',
    example: 'Al Olaya District',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  miniAddress!: string;
}
  