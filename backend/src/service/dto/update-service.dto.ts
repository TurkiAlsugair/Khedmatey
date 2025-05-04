import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsNotEmpty()
  nameAR: string;

  @IsString()
  @IsNotEmpty()
  nameEN: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsNumber()
  categoryId: number;
}
