import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  // To capitalize the valuue
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Status)
  status: Status;
}
