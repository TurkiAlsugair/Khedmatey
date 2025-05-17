import { IsNotEmpty, IsPhoneNumber, IsString, IsOptional, IsBoolean, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Role, Status } from "@prisma/client";

export class LookupUserDto {
  @ApiProperty({
    description: 'Phone number of the user to find',
    example: '+966123456789',
    required: false
  })
  
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Filter customers by blacklist status (only applies to customers)',
    example: 'true',
    required: false,
    type: Boolean
  })

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  blacklisted?: boolean;

  @ApiProperty({
    description: 'Role of the user (CUSTOMER or SERVICE_PROVIDER)',
    enum: Role,
    example: 'CUSTOMER',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(Role)
  role: Role;
} 