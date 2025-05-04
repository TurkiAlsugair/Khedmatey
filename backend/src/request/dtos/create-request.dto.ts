// create-request.dto.ts

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsDefined, ValidateNested } from 'class-validator';
import { LocationDto } from './location.dto';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDefined()               // must be present
  @ValidateNested()          // validate nested fields
  @Type(() => LocationDto)   // enable transformation/validation
  location!: LocationDto;

  @IsNotEmpty()
  @IsString()
  date!: string;        
}
