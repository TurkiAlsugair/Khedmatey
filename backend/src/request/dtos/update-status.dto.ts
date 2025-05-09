// src/requests/dto/update-request-status.dto.ts
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestStatusDto {
  @ApiProperty({
    description: 'New status for the request',
    enum: Status,
    examples: {
      PENDING_BY_SP: { value: 'PENDING_BY_SP', summary: 'Request is pending review by service provider' },
      ACCEPTED: { value: 'ACCEPTED', summary: 'Request is accepted by service provider' },
      DECLINED: { value: 'DECLINED', summary: 'Request is declined by service provider' },
      CANCELED: { value: 'CANCELED', summary: 'Request is canceled by customer, service provider, or worker' },
      COMING: { value: 'COMING', summary: 'Worker is on the way' },
      IN_PROGRESS: { value: 'IN_PROGRESS', summary: 'Service is being performed' },
      FINISHED: { value: 'FINISHED', summary: 'Service has been completed' },
      INVOICED: { value: 'INVOICED', summary: 'Invoice has been generated' },
      PAID: { value: 'PAID', summary: 'Payment has been received' }
    },
    required: true
  })
  @IsEnum(Status)
  status: Status;
}