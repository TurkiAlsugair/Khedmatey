import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Role } from '@prisma/client';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private customerService: CustomerService
  ) {}

  async deleteUser(id: string, role: Role) {
    if (role === Role.CUSTOMER) 
      return this.customerService.deleteCustomer(id);
    
    else if (role === Role.SERVICE_PROVIDER) {
      const provider = await this.prisma.serviceProvider.findUnique({ where: { id } });
      if (!provider) 
        throw new NotFoundException(`Service provider with ID ${id} not found`);
      
      await this.prisma.serviceProvider.delete({ where: { id } });
      return { message: `Service provider with ID ${id} deleted successfully` };
    }

    else {
      throw new NotFoundException('User must be a customer or service provider');
    }
  }
}
