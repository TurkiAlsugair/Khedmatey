import { Body, Controller, Post} from '@nestjs/common';
import { AuthCustomerService } from './auth-customer.service';
import { CreateCustomerDto } from 'src/auth/auth-customer/dtos/create-customer.dto';

@Controller('auth-customer')
export class AuthCustomerController {

    constructor(private authCustomerService: AuthCustomerService){}

    @Post('signup')
    signup(@Body() createCustomerDto: CreateCustomerDto){
        // return this.authCustomerService.createCustomer(createCustomerDto)
        console.log("recieved")
    }
}
