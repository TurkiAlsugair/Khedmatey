import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Role, Status } from '@prisma/client';
import { CustomerService } from 'src/customer/customer.service';
import { AuthService } from 'src/auth/auth.service';
import { FindUserDto } from 'src/dtos/find-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private customerService: CustomerService,
    private authService: AuthService
  ) {}

  async lookUpUsers(phoneNumber?: string, blacklisted?: boolean) {

    //if phoneNumber is provided, find that specific user
    if (phoneNumber) {
      const user = await this.authService.findUser({ phoneNumber });
      
      if (!user) {
        throw new NotFoundException(`User with phone number ${phoneNumber} not found`);
      }
      
      //get full user information based on role
      if (user.role === Role.CUSTOMER) {
        const customer = await this.prisma.customer.findUnique({
          where: { phoneNumber },
          include: {
            Requests: {
              include: {
                service: true,
                location: true
              }
            }
          }
        });
        
        if (!customer) {
          throw new NotFoundException(`Customer with phone number ${phoneNumber} not found`);
        }
        
        return {
          ...user,
          requests: customer.Requests,
          isBlacklisted: customer.isBlacklisted
        };
      } 
      else if (user.role === Role.SERVICE_PROVIDER) {
        const serviceProvider = await this.prisma.serviceProvider.findUnique({
          where: { phoneNumber },
          include: {
            cities: true,
            services: true,
            workers: true,
            ProviderDays: true
          }
        });
        
        if (!serviceProvider) {
          throw new NotFoundException(`Service provider with phone number ${phoneNumber} not found`);
        }
        
        return {
          ...user,
          cities: serviceProvider.cities,
          services: serviceProvider.services,
          workers: serviceProvider.workers,
          providerDays: serviceProvider.ProviderDays,
          email: serviceProvider.email
        };
      }
      
      return user;
    }
    
    //if phoneNumber is not provided but blacklisted is, return all customers with that blacklist value
    if (blacklisted !== undefined) {
      const customers = await this.prisma.customer.findMany({
        where: { isBlacklisted: blacklisted },
        include: {
          Requests: {
            include: {
              service: true,
              location: true
            }
          }
        }
      });
      
      if (customers.length === 0) {
        throw new NotFoundException(`No customers found with blacklist status: ${blacklisted}`);
      }
      
      //format the response
      return customers.map(customer => {
        return {
          id: customer.id,
          username: customer.username,
          phoneNumber: customer.phoneNumber,
          role: Role.CUSTOMER,
          requests: customer.Requests,
          isBlacklisted: customer.isBlacklisted
        };
      });
    }
    
    //if no parameters are provided, throw an error
    throw new BadRequestException('At least one of phoneNumber or blacklisted must be provided');
  }

  async blacklistCustomer(customerId: string, blacklist: boolean) {
    
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { Requests: true }
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    let canceledRequestsCount = 0;

    //only cancel unpaid requests if blacklist is true
    if (blacklist === true) {
      //get all requests that are not in PAID status to cancel them
      const unpaidRequests = customer.Requests.filter(
        request => request.status !== Status.PAID
      );

      //Cancel all unpaid requests
      for (const request of unpaidRequests) {
        await this.prisma.request.update({
          where: { id: request.id },
          data: { status: Status.CANCELED }
        });
      }
      

      canceledRequestsCount = unpaidRequests.length;
    }

    //update the customer's blacklist status based on the passed value
    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customerId },
      data: { isBlacklisted: blacklist }
    });

    return {
      message: `Customer ${blacklist ? 'blacklisted' : 'removed from blacklist'} successfully`,
      canceledRequests: canceledRequestsCount,
      customerStatus: updatedCustomer.isBlacklisted ? 'blacklisted' : 'active'
    };
  }

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
