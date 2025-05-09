import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BlacklistCustomerDto {
  @ApiProperty({
    description: 'ID of the customer to blacklist or unblacklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Whether to blacklist (true) or unblacklist (false) the customer',
    example: true,
    required: true
  })
  @IsNotEmpty()
  @IsBoolean()
  blacklist: boolean;
} 