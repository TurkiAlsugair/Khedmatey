import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Role, Status } from '@prisma/client';
import { CustomerService } from 'src/customer/customer.service';
import { AuthService } from 'src/auth/auth.service';
import { format } from 'date-fns';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private customerService: CustomerService,
    private authService: AuthService
  ) {}

  // Helper function to format a request with date and invoice
  private formatRequest(request: any): any {
    const result: any = {
      id: request.id,
      customerId: request.customerId,
      serviceId: request.serviceId,
      locationId: request.locationId,
      notes: request.notes || "",
      status: request.status,
      createdAt: request.createdAt,
      providerDayId: request.providerDayId,
    };

    //add date formatting
    result.date = format(request.createdAt, 'dd/MM/yyyy');

    // Add service if it exists
    if (request.service) {
      result.service = {
        id: request.service.id,
        nameAR: request.service.nameAR,
        nameEN: request.service.nameEN,
        categoryId: request.service.categoryId,
        price: request.service.price,
        requiredNbOfWorkers: request.service.requiredNbOfWorkers,
        status: request.service.status,
        serviceProviderId: request.service.serviceProviderId
      };

      // Add service provider if available in service
      if (request.service.serviceProvider) {
        result.serviceProvider = {
          username: request.service.serviceProvider.username,
          usernameAR: request.service.serviceProvider.usernameAR,
          phoneNumber: request.service.serviceProvider.phoneNumber,
          email: request.service.serviceProvider.email
        };
      }
    }
      result.location = {
        id: request.location.id,
        city: request.location.city,
        fullAddress: request.location.fullAddress,
        miniAddress: request.location.miniAddress,
        lat: request.location.lat,
        lng: request.location.lng
      };

    //If the request has a followup service, add it
    if (request.followupService) {
      result.followupService = {
        id: request.followupService.id,
        categoryId: request.followupService.categoryId,
        nameEN: request.followupService.nameEN,
        nameAR: request.followupService.nameAR,
        descriptionEN: request.followupService.descriptionEN,
        descriptionAR: request.followupService.descriptionAR,
        price: request.followupService.price
      };
    }

    // Add invoice if there are invoice items
    if (request.invoiceItems && request.invoiceItems.length > 0) {
      result.invoice = {
        date: format(request.invoiceItems[0].createdAt, 'dd/MM/yyyy'),
        details: request.invoiceItems.map(item => ({
          nameEN: item.nameEN,
          nameAR: item.nameAR,
          price: item.price
        }))
      };
    }

    return result;
  }

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
                location: true,
                followupService: true,
                invoiceItems: true
              }
            }
          }
        });

        if (!customer) {
          throw new NotFoundException(`Customer with phone number ${phoneNumber} not found`);
        }

        // Format requests using the helper function
        const requests = customer.Requests.map(request => this.formatRequest(request));

        return {
          ...user,
          requests,
          isBlacklisted: customer.isBlacklisted
        };
      }
      else if (user.role === Role.SERVICE_PROVIDER) {
        const serviceProvider = await this.prisma.serviceProvider.findUnique({
          where: { phoneNumber },
          include: {
            cities: true,
            services: {
              include: {
                Requests: {
                  include: {
                    service: true,
                    location: true,
                    followupService: true,
                    invoiceItems: true,
                    customer: true
                  }
                }
              }
            },
            workers: true,
            ProviderDays: true
          }
        });
        
        if (!serviceProvider) {
          throw new NotFoundException(`Service provider with phone number ${phoneNumber} not found`);
        }

        //extract all requests from all services
        const allRequests = serviceProvider.services.flatMap(service => service.Requests);
        
        //format the requests using our helper function
        const formattedRequests = allRequests.map(request => this.formatRequest(request));
        
        const citiesArray = serviceProvider.cities.map(city => city.name);
        
        const workersArray = serviceProvider.workers.map(worker => ({
          username: worker.username,
          phoneNumber: worker.phoneNumber
        }));
        
        return {
          id: serviceProvider.id,
          username: serviceProvider.username,
          phoneNumber: serviceProvider.phoneNumber,
          email: serviceProvider.email,
          role: Role.SERVICE_PROVIDER,
          cities: citiesArray,
          services: serviceProvider.services.map(service => ({
            id: service.id,
            nameAR: service.nameAR,
            nameEN: service.nameEN,
            categoryId: service.categoryId,
            price: service.price,
            requiredNbOfWorkers: service.requiredNbOfWorkers,
            status: service.status,
            serviceProviderId: service.serviceProviderId
          })),
          workers: workersArray,
          providerDays: serviceProvider.ProviderDays,
          requests: formattedRequests
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
              location: true,
              followupService: true,
              invoiceItems: true
            }
          }
        }
      });

      if (customers.length === 0) {
        throw new NotFoundException(`No customers found with blacklist status: ${blacklisted}`);
      }

      //format requests for each customer using the helper function
      customers.forEach(customer => {
        customer.Requests = customer.Requests.map(request => this.formatRequest(request));
      });

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
  }

  async blacklistUser(userId: string, blacklist: boolean, role: Role) {

    //check if user is a customer
    if (role === Role.CUSTOMER) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: userId },
        include: { Requests: true }
      });

      if (customer) {


        //only update requests if blacklisting the user
        if (blacklist === true) {
          //process each request according to its status
          for (const request of customer.Requests) {
            //don't change status if it's INVOICED, PAID, or DECLINED
            if (request.status === Status.INVOICED || request.status === Status.PAID || request.status === Status.DECLINED) {
              continue;
            }

            //set FINISHED requests to INVOICED
            if (request.status === Status.FINISHED) {
              await this.prisma.request.update({
                where: { id: request.id },
                data: { status: Status.INVOICED }
              });
            }

            //cancel requests in PENDING, ACCEPTED, COMING, or IN_PROGRESS status
            if (request.status === Status.PENDING || request.status === Status.ACCEPTED ||
              request.status === Status.COMING || request.status === Status.IN_PROGRESS) {
              await this.prisma.request.update({
                where: { id: request.id },
                data: { status: Status.CANCELED }
              });
            }
          }
        }

        //update the customer's blacklist status
        await this.prisma.customer.update({
          where: { id: userId },
          data: { isBlacklisted: blacklist }
        });

        return;
      }
    }

    //if not found as customer or explicitly looking for a service provider
    if (role === Role.SERVICE_PROVIDER) {
      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: userId },
        include: {
          services: {
            include: {
              Requests: true
            }
          }
        }
      });

      if (!serviceProvider) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      //only update requests if blacklisting the service provider
      if (blacklist === true) {
        //collect all requests from all services of this provider
        const allRequests = serviceProvider.services.flatMap(service => service.Requests);

        //process each request according to its status
        for (const request of allRequests) {
          if (request.status === Status.INVOICED || request.status === Status.PAID || request.status === Status.DECLINED) {
            continue;
          }
          if (request.status === Status.FINISHED) {
            await this.prisma.request.update({
              where: { id: request.id },
              data: { status: Status.INVOICED }
            });
          }
          if (request.status === Status.PENDING || request.status === Status.ACCEPTED ||
            request.status === Status.COMING || request.status === Status.IN_PROGRESS) {
            await this.prisma.request.update({
              where: { id: request.id },
              data: { status: Status.CANCELED }
            });
          }
        }
      }

      // Update the service provider's blacklist status
      // Using raw query to bypass potential Prisma client type issues
      await this.prisma.serviceProvider.update({
        where: { id: userId },
        data: { isBlacklisted: blacklist}
      });

      //update the service provider's status
      await this.prisma.serviceProvider.update({
        where: { id: userId },
        data: { status: blacklist ? Status.PENDING : Status.ACCEPTED }
      });

      return;
    }
  }
  
  async deleteUser(id: string, role: Role) {
    if (role === Role.CUSTOMER) {
      await this.customerService.deleteCustomer(id);
      return { id, role };
    }
    else if (role === Role.SERVICE_PROVIDER) {
      const provider = await this.prisma.serviceProvider.findUnique({ where: { id } });
      if (!provider)
        throw new NotFoundException(`Service provider with ID ${id} not found`);

      await this.prisma.serviceProvider.delete({ where: { id } });
      return { id, role };
    }
    else {
      throw new NotFoundException('User must be a customer or service provider');
    }
  }

  async getAllComplaints() {
    const complaints = await this.prisma.complaint.findMany({
      include: {
        request: {
          include: {
            customer: true,
            service: true,
            location: true,
          }
        },
        serviceProvider: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
            email: true,
            avgRating: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (complaints.length === 0) {
      return {
        message: 'No complaints found',
        data: []
      };
    }

    return {
      message: 'Complaints retrieved successfully',
      data: complaints,
    };
  }

  async getAllUnhandledRequests() {
    //get all unhandled requests
    const unhandledRequests = await this.prisma.request.findMany({
      where: {
        status: {
          in: [Status.PENDING, Status.CANCELED]
        }
      },
      include: {
        service: {
          include: {
            serviceProvider: true
          }
        },
        customer: true,
        location: true,
        providerDay: true,
        followupService: true,
        invoiceItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    //format the requests
    const formattedRequests = unhandledRequests.map(request => {

      const result: any = {
        id: request.id,
        customerId: request.customerId,
        serviceId: request.serviceId,
        locationId: request.locationId,
        notes: request.notes || "",
        status: request.status,
        createdAt: request.createdAt,
        providerDayId: request.providerDayId,

        service: {
          id: request.service.id,
          nameAR: request.service.nameAR,
          nameEN: request.service.nameEN,
          categoryId: request.service.categoryId,
          price: request.service.price,
          requiredNbOfWorkers: request.service.requiredNbOfWorkers,
          status: request.service.status,
          serviceProviderId: request.service.serviceProviderId
        },

        serviceProvider: {
          username: request.service.serviceProvider.username,
          usernameAR: request.service.serviceProvider.usernameAR,
          phoneNumber: request.service.serviceProvider.phoneNumber,
          email: request.service.serviceProvider.email
        },

        customer: {
          username: request.customer.username,
          phoneNumber: request.customer.phoneNumber
        },

        location: {
          id: request.location.id,
          city: request.location.city,
          fullAddress: request.location.fullAddress,
          miniAddress: request.location.miniAddress,
          lat: request.location.lat,
          lng: request.location.lng
        }
      };

      //add the formatted date
      result.date = format(request.createdAt, 'dd/MM/yyyy');

      //if the request has a followup service, add it
      if (request.followupService) {
        result.followupService = {
          id: request.followupService.id,
          categoryId: request.followupService.categoryId,
          nameEN: request.followupService.nameEN,
          nameAR: request.followupService.nameAR,
          descriptionEN: request.followupService.descriptionEN,
          descriptionAR: request.followupService.descriptionAR,
          price: request.followupService.price
        };
      }

      if (request.invoiceItems && request.invoiceItems.length > 0) {
        result.invoice = {
          date: format(request.invoiceItems[0].createdAt, 'dd/MM/yyyy'),
          details: request.invoiceItems.map(item => ({
            nameEN: item.nameEN,
            nameAR: item.nameAR,
            price: item.price
          }))
        };
      }

      return result;
    });

    return formattedRequests;
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {

    //define relevant status for each entity type
    const serviceProviderStatus = [Status.PENDING, Status.ACCEPTED, Status.DECLINED];
    const serviceStatus = [Status.PENDING, Status.ACCEPTED, Status.DECLINED];
    const allStatus = Object.values(Status); //only requests can have all status

    //get service provider counts by status
    const serviceProvidersCount = await this.prisma.serviceProvider.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    //format service provider status count
    const serviceProviderStats: Record<string, number> = {};

    //initialize relevant status with 0 count
    // the goal of initialization is to ensure even status with 0 count will be in the array 
    // because the database will not return it if it has 0 count
    serviceProviderStatus.forEach(status => {
      serviceProviderStats[status] = 0;
    });

    //update with actual counts from database
    for (const item of serviceProvidersCount) {
      serviceProviderStats[item.status] = item._count.id;
    }

    //get total customers count
    const totalCustomers = await this.prisma.customer.count();

    //get service counts by status
    const servicesCount = await this.prisma.service.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    //format service status count
    const serviceStats: Record<string, number> = {};

    //initialize relevant status with 0 count
    // the goal of initialization is to ensure even status with 0 count will be in the array 
    // because the database will not return it if it has 0 count
    serviceStatus.forEach(status => {
      serviceStats[status] = 0;
    });

    //update with actual counts from database
    for (const item of servicesCount) {
      serviceStats[item.status] = item._count.id;
    }

    //get request counts by status
    const requestsCount = await this.prisma.request.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    //format request status count
    const requestStats: Record<string, number> = {};

    //initialize all status with 0 count
    // the goal of initialization is to ensure even status with 0 count will be in the array 
    // because the database will not return it if it has 0 count
    allStatus.forEach(status => {
      requestStats[status] = 0;
    });

    //update with actual counts from database
    for (const item of requestsCount) {
      requestStats[item.status] = item._count.id;
    }

    //get total workers count
    const totalWorkers = await this.prisma.worker.count();

    //calculate total counts
    const totalServiceProviders = Object.values(serviceProviderStats).reduce((a: number, b: number) => a + b, 0);
    const totalServices = Object.values(serviceStats).reduce((a: number, b: number) => a + b, 0);
    const totalRequests = Object.values(requestStats).reduce((a: number, b: number) => a + b, 0);

    //return formatted status counts
    return {
      serviceProviders: {
        total: totalServiceProviders,
        byStatus: serviceProviderStats
      },
      customers: {
        total: totalCustomers
      },
      services: {
        total: totalServices,
        byStatus: serviceStats
      },
      requests: {
        total: totalRequests,
        byStatus: requestStats
      },
      workers: {
        total: totalWorkers
      }
    };
  }
}
