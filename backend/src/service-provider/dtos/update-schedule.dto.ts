import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'List of dates to block (in YYYY-MM-DD format)',
    example: ['2023-01-01', '2023-01-02'],
    isArray: true,
    required: true
  })
  @IsArray()
  @IsString({ each: true })            // expects ISO "YYYY-MM-DD" strings
  dates!: string[];
}