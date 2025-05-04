// src/requests/dto/update-request-status.dto.ts
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateRequestStatusDto {
  @IsEnum(Status)
  status: Status;
}