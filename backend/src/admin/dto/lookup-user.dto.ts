import { IsNotEmpty, IsPhoneNumber, IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

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
} 