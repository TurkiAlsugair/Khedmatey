import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Role, Status } from '@prisma/client';
import { CustomerService } from 'src/customer/customer.service';
import { AuthService } from 'src/auth/auth.service';
import { format } from 'date-fns';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RequestService } from 'src/request/request.service';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: DatabaseService,
    private customerService: CustomerService,
    private authService: AuthService,
    private requestService: RequestService
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

  async lookUpUsers(phoneNumber?: string, blacklisted?: boolean, role?: Role) {
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

        //Format requests using the helper function
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
                    service: {
                      include: {
                        serviceProvider: true
                      }
                    },
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

        return {
          id: serviceProvider.id,
          username: serviceProvider.username,
          phoneNumber: serviceProvider.phoneNumber,
          email: serviceProvider.email,
          role: Role.SERVICE_PROVIDER,
          cities: serviceProvider.cities.map(city => city.name),
          isBlacklisted: serviceProvider.isBlacklisted,
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
          workers: serviceProvider.workers,
          providerDays: serviceProvider.ProviderDays,
          requests: serviceProvider.services.flatMap(service => service.Requests).map(request => this.formatRequest(request))
        };
      }
      
      return user;
    }
    
    //if phoneNumber is not provided but blacklisted is, return all customers or providers with that blacklist value
    if (blacklisted !== undefined) {
      //if role is specified, return blacklisted users of that specific role
      if (role) {
        if (role === Role.CUSTOMER) {
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
        } else if (role === Role.SERVICE_PROVIDER) {
          const serviceProviders = await this.prisma.serviceProvider.findMany({
            where: { isBlacklisted: blacklisted },
            include: {
              cities: true,
              services: {
                include: {
                  Requests: {
                    include: {
                      service: {
                        include: {
                          serviceProvider: true
                        }
                      },
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

          if (serviceProviders.length === 0) {
            throw new NotFoundException(`No service providers found with blacklist status: ${blacklisted}`);
          }

          return serviceProviders.map(provider => {
            return {
              id: provider.id,
              username: provider.username,
              phoneNumber: provider.phoneNumber,
              email: provider.email,
              role: Role.SERVICE_PROVIDER,
              cities: provider.cities.map(city => city.name),
              services: provider.services.map(service => ({
                id: service.id,
                nameAR: service.nameAR,
                nameEN: service.nameEN,
                categoryId: service.categoryId,
                price: service.price,
                requiredNbOfWorkers: service.requiredNbOfWorkers,
                status: service.status,
                serviceProviderId: service.serviceProviderId
              })),
              workers: provider.workers,
              providerDays: provider.ProviderDays,
              requests: provider.services.flatMap(service => service.Requests).map(request => this.formatRequest(request)),
              isBlacklisted: provider.isBlacklisted
            };
          });
        } else {
          throw new BadRequestException(`Invalid role: ${role}. Only CUSTOMER and SERVICE_PROVIDER roles are accepted.`);
        }
      } else {
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

        const serviceProviders = await this.prisma.serviceProvider.findMany({
          where: { isBlacklisted: blacklisted },
          include: {
            cities: true,
            services: {
              include: {
                Requests: {
                  include: {
                    service: {
                      include: {
                        serviceProvider: true
                      }
                    },
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

        //format customer data
        const formattedCustomers = customers.map(customer => {
          return {
            id: customer.id,
            username: customer.username,
            phoneNumber: customer.phoneNumber,
            role: Role.CUSTOMER,
            requests: customer.Requests.map(request => this.formatRequest(request)),
            isBlacklisted: customer.isBlacklisted
          };
        });

        //format service provider data
        const formattedProviders = serviceProviders.map(provider => {
          return {
            id: provider.id,
            username: provider.username,
            phoneNumber: provider.phoneNumber,
            email: provider.email,
            role: Role.SERVICE_PROVIDER,
            cities: provider.cities.map(city => city.name),
            services: provider.services.map(service => ({
              id: service.id,
              nameAR: service.nameAR,
              nameEN: service.nameEN,
              categoryId: service.categoryId,
              price: service.price,
              requiredNbOfWorkers: service.requiredNbOfWorkers,
              status: service.status,
              serviceProviderId: service.serviceProviderId
            })),
            workers: provider.workers,
            providerDays: provider.ProviderDays,
            requests: provider.services.flatMap(service => service.Requests).map(request => this.formatRequest(request)),
            isBlacklisted: provider.isBlacklisted
          };
        });

        const allBlacklistedUsers = [...formattedCustomers, ...formattedProviders];

        if (allBlacklistedUsers.length === 0) {
          throw new NotFoundException(`No users found with blacklist status: ${blacklisted}`);
        }

        return allBlacklistedUsers;
      }
    }
    
    throw new BadRequestException('Phone number or blacklisted parameter must be provided');
  }

  async blacklistUser(userId: string, isBlacklisted: boolean, role: Role, adminToken: GenerateTokenDto) {
    
    if (role === Role.CUSTOMER) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: userId },
        include: { Requests: true }
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${userId} not found`);
      }

      //only update requests if blacklisting the user
      if (isBlacklisted === true) {
        //process each request according to its status
        for (const request of customer.Requests) {
          //don't change status if it's INVOICED, PAID, or DECLINED
          if (request.status === Status.INVOICED || request.status === Status.PAID || request.status === Status.DECLINED) {
            continue;
          }

          //set FINISHED requests to INVOICED
          if (request.status === Status.FINISHED) {
            await this.requestService.updateStatus(request.id, adminToken, Status.INVOICED);
          }

          //cancel requests in PENDING, ACCEPTED, COMING, or IN_PROGRESS status
          if (request.status === Status.PENDING || request.status === Status.ACCEPTED ||
            request.status === Status.COMING || request.status === Status.IN_PROGRESS) {
            await this.requestService.updateStatus(request.id, adminToken, Status.CANCELED);
          }
        }
      }

      await this.prisma.customer.update({
        where: { id: userId },
        data: { isBlacklisted }
      });

      return {
        message: `Customer ${isBlacklisted ? 'blacklisted' : 'unblacklisted'} successfully`,
        role: Role.CUSTOMER,
        id: userId
      };
    }
    else if (role === Role.SERVICE_PROVIDER) {
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
        throw new NotFoundException(`Service provider with ID ${userId} not found`);
      }

      //only update requests if blacklisting the service provider
      if (isBlacklisted === true) {
        //collect all requests from all services of this provider
        const allRequests = serviceProvider.services.flatMap(service => service.Requests);

        //handle each request according to its status
        for (const request of allRequests) {
          if (request.status === Status.INVOICED || request.status === Status.PAID || request.status === Status.DECLINED) {
            continue;
          }
          if (request.status === Status.FINISHED) {
            await this.requestService.updateStatus(request.id, adminToken, Status.INVOICED);
          }
          if (request.status === Status.PENDING || request.status === Status.ACCEPTED ||
            request.status === Status.COMING || request.status === Status.IN_PROGRESS) {
            await this.requestService.updateStatus(request.id, adminToken, Status.CANCELED);
          }
        }
      }

      await this.prisma.serviceProvider.update({
        where: { id: userId },
        data: { isBlacklisted: isBlacklisted}
      });

      //update the service provider's status
      await this.prisma.serviceProvider.update({
        where: { id: userId },
        data: { status: isBlacklisted ? Status.PENDING : Status.ACCEPTED }
      });

      return {
        message: `Service provider ${isBlacklisted ? 'blacklisted' : 'unblacklisted'} successfully`,
        role: Role.SERVICE_PROVIDER,
        id: userId
      };
    }
    else {
      throw new BadRequestException(`Invalid role`);
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
