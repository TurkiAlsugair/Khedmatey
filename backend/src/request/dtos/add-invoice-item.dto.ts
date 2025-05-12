import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddInvoiceItemDto {
  @ApiProperty({
    description: 'Name of the invoice item in Arabic',
    example: 'رسوم الخدمة',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  nameAR: string;

  @ApiProperty({
    description: 'Name of the invoice item in English',
    example: 'Service call fee',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  nameEN: string;

  @ApiProperty({
    description: 'Price of the invoice item',
    example: 50.00,
    required: true
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
} 