import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCustomerDto{
    @ApiProperty({
        description: 'New username for the customer (optional)',
        example: 'updatedUsername',
        required: false
    })
    @IsOptional()
    @IsString()
    username: string;

    @ApiProperty({
        description: 'Current phone number for the customer',
        example: '+966123456789',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phoneNumber: string;
}
