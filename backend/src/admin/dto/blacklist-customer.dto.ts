import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class BlacklistCustomerDto {
  @ApiProperty({
    description: 'ID of the user to blacklist or unblacklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Whether to blacklist (true) or unblacklist (false) the user',
    example: true,
    required: true
  })
  @IsNotEmpty()
  @IsBoolean()
  isBlacklisted: boolean;
  
  @ApiProperty({
    description: 'Role of the user (CUSTOMER or SERVICE_PROVIDER)',
    enum: Role,
    example: 'CUSTOMER',
    required: false
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;
} 