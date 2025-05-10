import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddInvoiceItemDto {
  @ApiProperty({
    description: 'Description of the invoice item',
    example: 'Service call fee',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  description: string;

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