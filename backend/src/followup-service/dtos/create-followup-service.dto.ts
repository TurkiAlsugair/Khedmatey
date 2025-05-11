import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowupServiceDto {
  @ApiProperty({
    description: 'ID of the original request that needs a follow-up service',
    example: 'request-uuid',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Name of the follow-up service in Arabic',
    example: 'خدمة متابعة التنظيف',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  nameAR: string;

  @ApiProperty({
    description: 'Name of the follow-up service in English',
    example: 'Cleaning Follow-up Service',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  nameEN: string;

  @ApiProperty({
    description: 'Description of the follow-up service in Arabic',
    example: 'خدمة متابعة لتنظيف المنزل والتأكد من جودة العمل',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  descriptionAR: string;

  @ApiProperty({
    description: 'Description of the follow-up service in English',
    example: 'Follow-up service to clean the house and ensure quality of work',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  descriptionEN: string;

  @ApiProperty({
    description: 'ID of the category for this follow-up service',
    example: 1,
    required: true
  })
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @ApiProperty({
    description: 'Price of the follow-up service',
    example: '150',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({
    description: 'Number of workers required for this follow-up service',
    example: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  requiredNbOfWorkers?: number;

  @ApiProperty({
    description: 'Additional notes for the follow-up service (optional)',
    example: 'Please check the previous work',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 