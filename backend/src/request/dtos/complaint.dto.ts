import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({
    description: 'Description of the complaint',
    example: 'The service provided was not as described. The worker arrived late and did not complete the job properly.',
    minLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;
} 