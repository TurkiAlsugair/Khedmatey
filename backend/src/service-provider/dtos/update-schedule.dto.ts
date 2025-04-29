import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @IsArray()
  @IsString({ each: true })            // expects ISO "YYYY-MM-DD" strings
  dates!: string[];
}