import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FindUserDto {
  @ApiProperty({
    description: 'Phone number of the user to find',
    example: '+966123456789',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;
}
