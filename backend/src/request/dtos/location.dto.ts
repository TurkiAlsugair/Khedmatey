import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsLatitude,
    IsLongitude,
  } from 'class-validator';
  // !: hush the compiler
  export class LocationDto {
    @IsNotEmpty()
    @IsString()
    city!: string;
  
    @IsNotEmpty()
    @IsString()
    fullAddress!: string;
  
    @Type(() => Number)
    @IsLatitude()
    lat!: number;
  
    @Type(() => Number)
    @IsLongitude()
    lng!: number;
  
    @IsNotEmpty()
    @IsString()
    miniAddress!: string;
  }
  