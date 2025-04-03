import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  nameAR: string;

  @IsString()
  @IsNotEmpty()
  nameEN: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsInt()
  categoryId: number;
}
