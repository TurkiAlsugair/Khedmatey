import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Updated service name in Arabic',
    example: 'خدمة السباكة المحدثة',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  nameAR: string;

  @ApiProperty({
    description: 'Updated service name in English',
    example: 'Updated Plumbing Service',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  nameEN: string;

  @ApiProperty({
    description: 'Updated service price',
    example: '120',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    description: 'Updated category ID for the service',
    example: 1,
    required: true
  })
  @IsNumber()
  categoryId: number;
}
