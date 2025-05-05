import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Get all customers', description: 'Retrieve a list of all customers' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of customers retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'customer-uuid' },
          username: { type: 'string', example: 'customerName' },
          phoneNumber: { type: 'string', example: '+123456789' }
        }
      }
    }
  })
  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @ApiOperation({ summary: 'Get customer by ID', description: 'Retrieve customer information by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'customer-uuid' },
        username: { type: 'string', example: 'customerName' },
        phoneNumber: { type: 'string', example: '+123456789' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update customer', description: 'Update customer information' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'customer-uuid' },
        username: { type: 'string', example: 'updatedCustomerName' },
        phoneNumber: { type: 'string', example: '+123456789' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @ApiOperation({ summary: 'Delete customer', description: 'Delete a customer account' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'customer-uuid' },
        username: { type: 'string', example: 'customerName' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
