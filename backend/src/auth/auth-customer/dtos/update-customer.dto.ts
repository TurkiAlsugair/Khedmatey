import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";


export class UpdateCustomerDto{

    @IsOptional()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phoneNumber: string
}