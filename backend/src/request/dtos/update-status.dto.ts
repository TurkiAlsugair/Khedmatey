// src/requests/dto/update-request-status.dto.ts
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestStatusDto {
  @ApiProperty({
    description: 'New status for the request',
    enum: Status,
    example: 'ACCEPTED',
    required: true
  })
  @IsEnum(Status)
  status: Status;
}