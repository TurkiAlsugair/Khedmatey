import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthCustomerService } from "./auth-customer.service";
import { CreateCustomerDto } from "src/auth/auth-customer/dtos/create-customer.dto";
import { Request } from "express";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { Roles } from "../decorators/roles.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "../guards/roles.guard";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { UpdateCustomerDto } from "./dtos/update-customer.dto";
import { OwnerGuard } from "../guards/owner.guard";

@Controller("auth/customer")
export class AuthCustomerController {
  constructor(private authCustomerService: AuthCustomerService) {}

  @Post("signup")
  async signup(@Body() createCustomerDto: CreateCustomerDto): Promise<BaseResponseDto> {
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

  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Patch("/account")
  async updateCustomer(@Body() updateDto: UpdateCustomerDto, @Req() req: Request): Promise<BaseResponseDto> {

    try{

      // updateDto: { "phoneNumber": "...", "username": "..." }
      const result = await this.authCustomerService.updateCustomer(updateDto);
      return{
        message: "Customer updated successfully ",
        data: {updateDto}
      }
      
    }catch(err){
      throw err
    }
  }

  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get("status")
  status(@Req() req: Request) {
    return req.user;
  }
}
