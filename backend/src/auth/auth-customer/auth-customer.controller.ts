import { Body, Controller, Post } from "@nestjs/common";
import { AuthCustomerService } from "./auth-customer.service";
import { CreateCustomerDto } from "src/auth/auth-customer/dtos/create-customer.dto";

@Controller("auth/customer")
export class AuthCustomerController {
  constructor(private authCustomerService: AuthCustomerService) {}

  @Post("signup")
  async signup(@Body() createCustomerDto: CreateCustomerDto) {
    try 
    {
      const result = await this.authCustomerService.signupCustomer(createCustomerDto);
      return {
        message: "Customer created successfully ",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.newCustomer,
        },
      };
    } 
    catch (err) {
      throw err;
    }
  }
}
