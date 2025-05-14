import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
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

export class AddInvoiceItemDto {
  @ApiProperty({
    description: 'Array of invoice items to add',
    type: [InvoiceItemDto],
    required: true
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
} 