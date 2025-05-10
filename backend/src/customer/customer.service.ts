import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DatabaseService } from 'src/database/database.service';
import { Role } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: DatabaseService) {}

  

  async updateCustomer({ phoneNumber, username }: UpdateCustomerDto) {
    const updateCustomer = await this.prisma.customer.findUnique({ where: { phoneNumber } });

    if (!updateCustomer)
      throw new NotFoundException(`Customer with phone ${phoneNumber} not found`);

    if (updateCustomer.role !== Role.CUSTOMER)
      throw new ForbiddenException('This phone number is not a customer');

    await this.prisma.customer.update({
      where: { phoneNumber },
      data: { username },
    });
    
    return { message: 'Customer updated successfully' };
  }


  async deleteCustomer(id: string) {
    const custmoer = await this.prisma.customer.findUnique({ where: { id } });

    if (!custmoer)
      throw new NotFoundException(`Customer with id ${id} not found`);

    if (custmoer.role !== Role.CUSTOMER)
        throw new ForbiddenException('This customer is not a customer');

    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }
}
