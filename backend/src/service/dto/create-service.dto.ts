import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name in Arabic',
    example: 'خدمة السباكة',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  nameAR: string;

  @ApiProperty({
    description: 'Service name in English',
    example: 'Plumbing Service',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  nameEN: string;

  @ApiProperty({
    description: 'Service description in Arabic',
    example: 'خدمة سباكة ممتازة وصيانة الحمامات',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  descriptionAR: string;

  @ApiProperty({
    description: 'Service description in English',
    example: 'Excellent plumbing service and bathroom maintenance',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  descriptionEN: string;

  @ApiProperty({
    description: 'Service price',
    example: '100',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    description: 'Category ID for the service',
    example: 1,
    required: true
  })
  @IsInt()
  categoryId: number;
}
