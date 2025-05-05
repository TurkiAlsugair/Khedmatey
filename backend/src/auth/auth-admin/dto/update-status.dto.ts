import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Status to update to',
    enum: Status,
    example: 'APPROVED',
    required: true
  })
  @IsEnum(Status)
  status: Status;
}
