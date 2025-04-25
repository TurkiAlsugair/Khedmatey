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
  
    @IsLatitude()
    lat!: number;
  
    @IsLongitude()
    lng!: number;
  
    @IsNotEmpty()
    @IsString()
    miniAddress!: string;
  }
  