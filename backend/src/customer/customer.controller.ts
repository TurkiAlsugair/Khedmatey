import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';


@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Update customer', description: 'Update an existing customer account' })
  @ApiParam({ name: 'id', type: 'string', description: 'Customer ID' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer updated successfully'
        },
        data: {
          type: 'object',
          properties: {
            updateDto: {
              type: 'object',
              properties: {
                username: { type: 'string', example: 'updatedUsername' },
                phoneNumber: { type: 'string', example: '+123456789' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer or not the owner' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Patch(":id/account")
  async updateCustomer(@Body() updateDto: UpdateCustomerDto): Promise<BaseResponseDto> {

    try{

      // updateDto: { "phoneNumber": "...", "username": "..." }
      const result = await this.customerService.updateCustomer(updateDto);
      return{
        message: "Customer updated successfully ",
        data: {updateDto}
      }
      
    }catch(err){
      throw err
    }
  }

  @ApiOperation({ summary: 'Delete customer', description: 'Delete an existing customer account' })
  @ApiParam({ name: 'id', type: 'string', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer deleted successfully'
        },
        data: {
          type: 'string',
          example: '+123456789'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a customer or not the owner' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.CUSTOMER) //set metadata
  @UseGuards(JwtAuthGuard, RolesGuard, OwnerGuard)
  @Delete(":id/account")
  async deleteCustomer(@Param('id') id: string): Promise<BaseResponseDto>{
    
    try{

      const result = await this.customerService.deleteCustomer(id)
      return{
        message: "Customer deleted successfully ",
        data: id
      }

    }catch(err){
      throw err
    }
  }

}
