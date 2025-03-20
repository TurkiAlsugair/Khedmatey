import { IsNotEmpty, IsPhoneNumber} from "class-validator";

export class sendOtpDto {

    @IsNotEmpty()
    @IsPhoneNumber() //validates if in E.164 format: +966551234567. does not check for length
    phoneNumber: string
}