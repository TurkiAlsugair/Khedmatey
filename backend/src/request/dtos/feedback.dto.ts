import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional review text',
    example: 'The service was great! The workers were professional and efficient.',
    required: false,
  })
  @IsOptional()
  @IsString()
  review?: string;
} 