// create-request.dto.ts

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsDefined, ValidateNested } from 'class-validator';
import { LocationDto } from './location.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'ID of the service being requested',
    example: 'service-uuid',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'ID of the customer making the request',
    example: 'customer-uuid',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Additional notes for the service provider (optional)',
    example: 'Please come before noon',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Location details for the service',
    type: () => LocationDto,
    required: true
  })
  @IsDefined()               // must be present
  @ValidateNested()          // validate nested fields
  @Type(() => LocationDto)   // enable transformation/validation
  location!: LocationDto;

  @ApiProperty({
    description: 'Date for the service request (in DD/MM/YYYY format)',
    example: '15/01/2023',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  date!: string;        
}
