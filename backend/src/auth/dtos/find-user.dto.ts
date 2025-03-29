import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class FindUserDto{

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phoneNumber: string
}
