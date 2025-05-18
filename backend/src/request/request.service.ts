import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dtos/create-request.dto';
import { DatabaseService } from 'src/database/database.service';
import { CityName, Status, Request, Customer, Role, WorkerDay, Worker, Service, Location } from '@prisma/client';
import { isBefore, isAfter, addDays, format, startOfDay } from 'date-fns';
import { ServiceService } from 'src/service/service.service';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { OrderStatusGateway } from 'src/sockets/order-status.gateway';
import { ServiceProviderService } from 'src/service-provider/service-provider.service';
import { forwardRef } from '@nestjs/common';
import { AddInvoiceItemDto } from './dtos/add-invoice-item.dto';

type RequestWithRelations = Request & {
  customer: Customer;
  providerDay: {
    serviceProviderId: string;
    date: Date;
  };
  dailyWorkers: Array<WorkerDay & {
    worker: Worker;
  }>;
  service: Service;
  location: Location;
  followupService?: {
    id: string;
    nameAR: string;
    nameEN: string;
    price: string;
    requiredNbOfWorkers: number;
    categoryId: number;
  };
  followupDailyWorkers?: Array<WorkerDay & {
    worker: Worker;
  }>;
  followUpProviderDay?: {
    serviceProviderId: string;
    date: Date;
  };
};

@Injectable()
export class RequestService {
  constructor(
    private prisma: DatabaseService, 
    @Inject(forwardRef(() => ServiceService)) private serviceService: ServiceService, 
    @Inject(forwardRef(() => ServiceProviderService)) private spService: ServiceProviderService,
    private orderStatusSocket: OrderStatusGateway
  ) {}

    async createRequest(createRequestDto: CreateRequestDto, userId: string) 
    {
        const { serviceId, customerId, notes, location, date } = createRequestDto;

        //1- Basic checks --------------

        //validate the service
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: { serviceProvider: true },
        });
        if (!service) {
            throw new NotFoundException('Service not found');
        }

        //validate customer
        const custmoer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!custmoer) {
            throw new NotFoundException('Customer not found');
        }
        
        //check if customer has any INVOICED requests (prevent new requests if there are unpaid invoices)
        const invoicedRequests = await this.prisma.request.findFirst({
            where: {
                customerId,
                status: Status.INVOICED
            }
        });
        
        if (invoicedRequests) {
            throw new BadRequestException('You have unpaid invoices. Please pay them before creating a new request.');
        }

        //get provider
        const providerId = service.serviceProviderId;

        //validate date
        const requestDate = this.validateDate(date)
        
        //check if customer already has a request on the same day
        const existingRequestsOnSameDay = await this.prisma.request.findFirst({
            where: {
                customerId,
                providerDay: {
                    date: {
                        gte: startOfDay(requestDate),
                        lt: addDays(startOfDay(requestDate), 1)
                    }
                }
            }
        });
        
        if (existingRequestsOnSameDay) {
            throw new BadRequestException('You already have a request scheduled for this day. Please choose a different day.');
        }

        //validate location is within provider's cities
        const providerCities = await this.prisma.city.findMany({
            where: {
                providers: {
                    some: { id: providerId }
                }
            }
        });

        //extract cities's of provider to compare with provided location
        const city = await this.serviceService.parseCity(location.city) //normalize it and return it as enum
        const cityNames = providerCities.map(c => c.name); //keep as enum
        if (!cityNames.includes(city)) {
            throw new BadRequestException('Location not served by this provider');
        }
        
        // 2- Check if date is available 
        const closedServiceDates = await this.serviceService.getSchedule(serviceId, location.city as CityName)
        if(closedServiceDates.includes(format(requestDate, 'dd/MM/yyyy'))){
          throw new BadRequestException("This service is closed for that day")
        }

        //get ProviderDay, if not exists, create it (not existing means it is available)
        const providerDay = await this.prisma.providerDay.upsert({
          where: {
            date_serviceProviderId: {
              date: requestDate,              
              serviceProviderId: providerId,
            },
          },
          update: {},  
          create: {                           
            date: requestDate,
            serviceProviderId: providerId,
            isClosed: false,                  
            isBusy:   false,
          },
        });

        //Create new request -------------------
        return this.prisma.$transaction(async (tx) => {
          
          //3- Get workers

          const providerWorkers = await tx.worker.findMany({
            where: {
              serviceProviderId: providerId,
            },
            select: { id: true, city: true },
          });

          //get all workers of provider who are in the same city of the request (each Worker belongs to exactly 1 city)
          const providerWorkersByCity = providerWorkers.filter(
            (w) => w.city.name === (city)
          ); 

          //find schedule of each worker, if not exist create it
          const dayWorkers = await Promise.all(
            providerWorkersByCity.map((w) =>
              tx.workerDay.upsert({
                where: {
                  workerId_providerDayId: 
                  { 
                    workerId: w.id, 
                    providerDayId: providerDay.id 
                  },
                },
                update: {}, 
                create: {
                  workerId: w.id,
                  providerDayId: providerDay.id,
                  nbOfAssignedRequests: 0,
                  capacity: 2,         
                },
                include: {
                  worker: true
                }
              }),
            ),
          );

          const availableDayWorkers = dayWorkers.filter(
            (dw) => dw.nbOfAssignedRequests < dw.capacity,
          );

          //get number of workers needed for the service
          const neededWorkers = service.requiredNbOfWorkers;
    
          // if not enough workers, it means either there is not enough workers available from this provider
          // or there is but they are not in the same city as the request
          if (availableDayWorkers.length < neededWorkers) {
            throw new BadRequestException('Not enough workers available for this service in the selected city');
          }
      
          //pick workers to work on the request
          //could have some kind of logic but not needed for now
          const chosenWorkers = availableDayWorkers.slice(0, neededWorkers);

          //create location if not exists
          const loc = await tx.location.create({
            data: {                                  
              city:         location.city,
              fullAddress:  location.fullAddress,
              miniAddress:  location.miniAddress,
              lat:          location.lat,
              lng:          location.lng,
            },
          });
      
        
          //4- Create the Request
          const newRequest = await tx.request.create({
            data: 
            {
              status: Status.PENDING,
              providerDayId: providerDay.id,
              serviceId: service.id,
              customerId: customerId,
              dailyWorkers: {
                connect: chosenWorkers.map(dw => ({ id: dw.id }))
              },
              notes,
              locationId:loc.id, 
            },
          });
          
          //increment number of requests for the day
          await tx.providerDay.update({
            where: { id: providerDay.id },
            data:  { totalRequestsCount: { increment: 1 } },
          });

          //increment nb of assigned requests for each workerDay
          for (const cw of chosenWorkers) {
            await tx.workerDay.update({
              where: { id: cw.id },
              data: { nbOfAssignedRequests: { increment: 1 } }
            });
          }

          //get updated workers after increment
          const updatedDayWorkers = await Promise.all(
            providerWorkers.map((w) =>
              tx.workerDay.upsert(
              {
                where: 
                {
                  workerId_providerDayId: 
                  {
                    workerId:      w.id,
                    providerDayId: providerDay.id,
                  },
                },
                update: {},
                create: 
                {
                  workerId:             w.id,
                  providerDayId:        providerDay.id,
                  nbOfAssignedRequests: 0,
                  capacity:             2,
                },
                select: 
                {
                  id:                   true,
                  workerId:             true,
                  nbOfAssignedRequests: true,
                  capacity:             true,
                },
              }),
            ),
          );

          //5- Update schedules --------------------------------------------
    
          //get nb of free workers to check if to close service for the day or not (based on if they have enouph capacity to get more requests)
          const freeWorkersCount = updatedDayWorkers.filter(dw => dw.nbOfAssignedRequests < dw.capacity).length;
          
          //close entire day for service provider if no workers are left
          if (freeWorkersCount === 0) 
          {
            await tx.providerDay.update({
              where: { id: providerDay.id },
              data: { isBusy: true }
            });

            //also close services schedule
            const services = await tx.service.findMany({
              where: { serviceProviderId: providerId },
              select: { id: true, requiredNbOfWorkers: true },
            });
            await Promise.all(services.map(({ id: svcId }) => 
              tx.serviceDay.upsert(
              { 
                where: 
                {
                  serviceId_providerDayId: {
                    serviceId:      svcId,
                    providerDayId:  providerDay.id,
                  },
                },
                update: {
                  isClosed: true,
                },
                create: {
                  serviceId:       svcId,
                  providerDayId:   providerDay.id,
                  isClosed:        true,
                },
              })
            ))
          }

          //unnesseary check because every service requires only 1 worker
          //other wise, check every service if enouph workers are available for it, else, close it for the day.
          //this does not check the avaialbity of a service based on city, that happens on the getService function of the service
          // else 
          // {
          //   const services = await tx.service.findMany({
          //     where: { serviceProviderId: providerId },
          //     select: { id: true, requiredNbOfWorkers: true },
          //   });
            
          //   await Promise.all(
          //     services.map(({ id: svcId, requiredNbOfWorkers }) => {
          //       const shouldClose = freeWorkersCount < requiredNbOfWorkers;
                
          //       return tx.serviceDay.upsert({
          //         where: {
          //           serviceId_providerDayId: {
          //             serviceId:      svcId,
          //             providerDayId:  providerDay.id,
          //           },
          //         },
          //         update: {
          //           isClosed: shouldClose,
          //         },
          //         create: {
          //           serviceId:       svcId,
          //           providerDayId:   providerDay.id,
          //           isClosed:        shouldClose,
          //         },
          //       });
          //     }),
          //   );
          // }      
          
          return newRequest;
        });

    }

    /*
    returns the requests that belongs to the requester.
    For service providers, requests are grouped by city instead of status.
    */
    async getRequests(user: GenerateTokenDto, statuses?: Status[]): Promise<Request[] | Record<string, Request[]> | any> {

      //1- build the base filter by role
      const where: any = {};
      switch (user.role) {
        case Role.SERVICE_PROVIDER:
          where.providerDay = {
            is: {
              serviceProviderId: user.id,
            },
          };
          break;
        case Role.CUSTOMER:
          where.customerId = user.id;
          break;
        case Role.WORKER:
          where.dailyWorkers = { some: { workerId: user.id } };
          break;
        default:
          throw new ForbiddenException('Invalid role');
      }
  
      //2- add optional status filter
      if (statuses && statuses.length > 0) {
        where.status = { in: statuses };
      }
  
      //3- fetch with all relevant relations
      const requests = await this.prisma.request.findMany({
        where,
        select: {
          id: true,
          status: true,
          notes: true,
          createdAt: true,
          customer: true,
          providerDay: { 
            select: { 
              date: true, 
              serviceProvider:true
            } 
          },
          dailyWorkers: { 
            include: { 
              worker: true 
            } 
          },
          service: {
            select: {
              id: true,
              nameEN: true,
              nameAR: true,
              price: true,
              descriptionEN: true,
              descriptionAR: true,
              serviceProvider: {
                select: {
                  id: true,
                  username: true,
                  usernameAR: true
                }
              }
            }
          },
          followupService: {
            select: {
              id: true,
              nameEN: true,
              nameAR: true,
              price: true,
              descriptionEN: true,
              descriptionAR: true
            }
          },
          location: true,
          invoiceItems: true,
          feedback: true,
          complaint: true
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Request[];

      //5- group and restructure the requests

      //determine whether to group by status or city based on user role
      const isProvider = user.role as Role === Role.SERVICE_PROVIDER;
      const groupingKey = isProvider
        ? (req: any) => req.location?.city
        : (req: any) => req.status;

      const groupingsSet = new Set(requests.map(groupingKey));
      const result = Array.from(groupingsSet).map(grouping => {
        const filteredRequests = requests.filter(req => 
          groupingKey(req) === grouping
        );
        
        //format each request to include date and service provider info
        const formattedRequests = filteredRequests.map(req => {
          const date = this.toDDMMYYYY((req as any).providerDay?.date).formatted;
          
          //extract needed properties without duplicating 'id'
          const { id, status, notes } = req;
          
          //calculate total price from invoice items if they exist
          const invoiceItems = (req as any).invoiceItems || [];
          const totalPrice = invoiceItems.reduce((sum: number, item: any) => sum + Number(item.price), 0).toString();
          
          //format invoice data if items exist
          let invoice: { date: string; details: any[] } | null = null;
          if (invoiceItems.length > 0) {
            // Find the most recent invoice item date
            const sortedItems = [...invoiceItems].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const latestDate = sortedItems[0]?.createdAt 
              ? format(new Date(sortedItems[0].createdAt), 'dd/MM/yyyy') 
              : format(new Date(), 'dd/MM/yyyy');
            
            //format invoice items details
            const details = invoiceItems.map((item: any) => ({
              nameAR: item.nameAR,
              nameEN: item.nameEN,
              price: item.price
            }));
            
            invoice = {
              date: latestDate,
              details
            };
          }
          
          // Extract service data
          const service = (req as any).service ? {
            id: (req as any).service.id,
            nameEN: (req as any).service.nameEN,
            nameAR: (req as any).service.nameAR,
            price: (req as any).service.price,
            descriptionEN: (req as any).service.descriptionEN,
            descriptionAR: (req as any).service.descriptionAR
          } : null;
          
          // Extract followUpService data
          const followUpService = (req as any).followupService ? {
            id: (req as any).followupService.id,
            nameEN: (req as any).followupService.nameEN,
            nameAR: (req as any).followupService.nameAR,
            price: (req as any).followupService.price,
            descriptionEN: (req as any).followupService.descriptionEN,
            descriptionAR: (req as any).followupService.descriptionAR
          } : null;
          
          // Extract location data
          const location = (req as any).location ? {
            miniAddress: (req as any).location.miniAddress,
            fullAddress: (req as any).location.fullAddress,
            city: (req as any).location.city,
            lat: (req as any).location.lat,
            lng: (req as any).location.lng
          } : null;
          
          return {
            id,
            date,
            totalPrice: totalPrice || "NA",
            serviceProvider: {
              username: (req as any).service?.serviceProvider?.username || '',
              usernameAR: (req as any).service?.serviceProvider?.usernameAR || ''
            },
            customer: {
              username: (req as any).customer?.username || '',
              phoneNumber: (req as any).customer?.phoneNumber || ''
            },
            invoice,
            status,
            notes,
            feedback: (req as any).feedback,
            complaint: (req as any).complaint,
            service,
            followUpService,
            location
          };
        });
        const groupingField = isProvider ? 'city' : 'status';
        return {
          [groupingField]: grouping,
          requests: formattedRequests
        };
      });
      
      return result;
    }

    //helper method to check if worker is assigned to a request (either original or follow-up)
    private isWorkerAssignedToRequest(request: RequestWithRelations, workerId: string): boolean {
      // If request has a follow-up service, only follow-up workers can change status
      if (request.followupService) {
        // Only allow follow-up workers to change status
        return request.followupDailyWorkers?.some(dw => dw.worker.id === workerId) || false;
      }
      
      // If no follow-up service, check regular assignment
      return request.dailyWorkers?.some(dw => dw.worker.id === workerId) || false;
    }

    async updateStatus(id: string, user: GenerateTokenDto, newStatus: Status) {

      //fetch the request with all necessary relations in one query
      const request = await this.prisma.request.findUnique({ 
        where: { id },
        include: {
          providerDay: { 
            select: { 
              serviceProviderId: true,
              date: true
            } 
          },
          customer: true,
          dailyWorkers: { 
            include: { 
              worker: true 
            } 
          },
          service: true,
          location: true,
          followupService: true,
          followupDailyWorkers: {
            include: {
              worker: true
            }
          },
          followUpProviderDay: {
            select: {
              serviceProviderId: true,
              date: true
            }
          }
        },
      }) as RequestWithRelations;
      
      if (!request) {
        throw new NotFoundException(`Request with id ${id} not found`);
      }
      
      const serviceProviderId = request.providerDay.serviceProviderId;
      
      //check if the request is pending and has been created for more than 10 min
      if (await this.autoCancel(request, Date.now())) {
        throw new ForbiddenException('Request automatically cancelled due to time limit');
      }
      
      let result: Request;
      
      //handle each status transition with appropriate handler method
      switch (newStatus) {
        case Status.ACCEPTED:
          result = await this.handleAccepted(request, user, serviceProviderId);
          break;
        case Status.DECLINED:
          result = await this.handleDeclined(request, user, serviceProviderId);
          break;
        case Status.CANCELED:
          result = await this.handleCanceled(request, user, serviceProviderId);
          break;
        case Status.COMING:
          result = await this.handleComing(request, user);
          break;
        case Status.IN_PROGRESS:
          result = await this.handleInProgress(request, user);
          break;
        case Status.FINISHED:
          result = await this.handleFinished(request, user);
          break;
        case Status.INVOICED:
          result = await this.handleInvoiced(request, user);
          break;
        case Status.PAID:
          result = await this.handlePaid(request, user);
          break;
        default:
          throw new BadRequestException("Unknown status transition");
      }

      this.orderStatusSocket.emitOrderStatusUpdate(result.id, result.status)
      return result;
    }

    //returns true and update request's status to cancelled if it has been created for more than 10 min, otherwise return false.
    private async autoCancel(request: RequestWithRelations, nowMs: number): Promise<boolean> {
      const tenMinutesMs = 10 * 60 * 1000;
      const age = nowMs - request.createdAt.getTime();

      if(request.status !== Status.PENDING || request.followupService){ //temp solution until adding a time limit for follow-up services: if request has a follow-up service, it cannot be cancelled
        return false;
      }

      if (age > tenMinutesMs) {
        await this.prisma.request.update({
          where: { id: request.id },
          data: { status: Status.CANCELED },
        });
        this.orderStatusSocket.emitOrderStatusUpdate(request.id, Status.CANCELED)
        return true;
      }
      return false;
    }

    async handleAccepted(request: RequestWithRelations, user: GenerateTokenDto, serviceProviderId: string){
      //validate current status - can only accept from PENDING
      if (request.status !== Status.PENDING) {
        throw new BadRequestException(`Cannot accept a request that is not in PENDING status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.SERVICE_PROVIDER) {
        throw new ForbiddenException('Only service providers may accept requests');
      }

      //validate ownership
      if (serviceProviderId !== user.id) {
        throw new ForbiddenException(
          'You can only accept requests assigned to your services',
        );
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.ACCEPTED },
      });
    }

    async handleDeclined(request: RequestWithRelations, user: GenerateTokenDto, serviceProviderId: string){
      //validate current status - can only decline from PENDING
      if (request.status !== Status.PENDING) {
        throw new BadRequestException(`Cannot decline a request that is not in PENDING status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.SERVICE_PROVIDER) {
        throw new ForbiddenException('Only service providers may decline requests');
      }

      //validate ownership
      if (serviceProviderId !== user.id) {
        throw new ForbiddenException(
          'You can only decline requests assigned to your services',
        );
      }

      //check if the request has invoice items
      const invoiceItems = await this.prisma.invoiceItem.findMany({
        where: { requestId: request.id }
      });

      const newStatus = invoiceItems.length > 0 ? Status.INVOICED : Status.CANCELED;
      
      const updatedRequest = await this.prisma.request.update({
        where: { id: request.id },
        data: { status: newStatus },
      });
  
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.DECLINED },
      });
    }

    async handleCanceled(request: RequestWithRelations, user: GenerateTokenDto, serviceProviderId: string){
 
      //validate current status based on role
      if (user.role === Role.CUSTOMER)
      {
        //customers can cancel PENDING or ACCEPTED requests
        if (request.status !== Status.PENDING && request.status !== Status.ACCEPTED && request.status !== Status.FINISHED) {
          throw new BadRequestException(`Customers can only cancel requests in PENDING or ACCEPTED status (current: ${request.status})`);
        }

        //verify ownership
        if (request.customerId !== user.id) {
          throw new ForbiddenException('You can only cancel your own requests');
        }
      } 

      else if (user.role === Role.SERVICE_PROVIDER) 
      {
        //service providers can only cancel PENDING requests
        if (request.status !== Status.PENDING) {
          throw new BadRequestException(`Service providers can only cancel requests in PENDING status (current: ${request.status})`);
        }

        //verify ownership
        if (serviceProviderId !== user.id) {
          throw new ForbiddenException('You can only cancel requests assigned to your services');
        }
      } 

      else if (user.role === Role.WORKER) {
        //workers can cancel ACCEPTED, COMING, or IN_PROGRESS requests
        if (request.status !== Status.ACCEPTED && request.status !== Status.COMING && request.status !== Status.IN_PROGRESS) {
          throw new BadRequestException(`Workers can only cancel requests in ACCEPTED, COMING, or IN_PROGRESS status (current: ${request.status})`);
        }

        //verify assignment - check if authorized to change this request
        if (!this.isWorkerAssignedToRequest(request, user.id)) {
          if (request.followupService) {
            throw new ForbiddenException('This request has a follow-up service. Only follow-up workers can change its status.');
          } 
          else {
            throw new ForbiddenException('You are not assigned to this request');
          }
        }
      } 
      else {
        throw new ForbiddenException('Your role cannot cancel requests');
      }
      
      // Check if the request has invoice items
      const invoiceItems = await this.prisma.invoiceItem.findMany({
        where: { requestId: request.id }
      });

      // If request has invoice items, set status to INVOICED instead of CANCELED
      const newStatus = invoiceItems.length > 0 ? Status.INVOICED : Status.CANCELED;
      
      const updatedRequest = await this.prisma.request.update({
        where: { id: request.id },
        data: { status: newStatus },
      });

      if(newStatus === Status.INVOICED) {
        this.orderStatusSocket.emitOrderStatusUpdate(updatedRequest.id, Status.INVOICED);
      } 
      else {
        this.orderStatusSocket.emitOrderStatusUpdate(updatedRequest.id, Status.CANCELED);
      }

      return updatedRequest;
    }

    async handleComing(request: RequestWithRelations, user: GenerateTokenDto){
      //validate current status - can only transition to COMING from ACCEPTED
      if (request.status !== Status.ACCEPTED) {
        throw new BadRequestException(`Can only set to COMING from ACCEPTED status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.WORKER) {
        throw new ForbiddenException('Only workers can mark a request as coming');
      }
      
      //check if this worker is authorized to change this request
      if (!this.isWorkerAssignedToRequest(request, user.id)) {
        if (request.followupService) {
          throw new ForbiddenException('This request has a follow-up service. Only follow-up workers can change its status.');
        } else {
          throw new ForbiddenException('You are not assigned to this request');
        }
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.COMING },
      });
    }

    async handleInProgress(request: RequestWithRelations, user: GenerateTokenDto){
      //validate current status - can only transition to IN_PROGRESS from COMING
      if (request.status !== Status.COMING) {
        throw new BadRequestException(`Can only set to IN_PROGRESS from COMING status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.WORKER) {
        throw new ForbiddenException('Only workers can mark a request as in progress');
      }
      
      //check if this worker is authorized to change this request
      if (!this.isWorkerAssignedToRequest(request, user.id)) {
        if (request.followupService) {
          throw new ForbiddenException('This request has a follow-up service. Only follow-up workers can change its status.');
        } else {
          throw new ForbiddenException('You are not assigned to this request');
        }
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.IN_PROGRESS },
      });
    }

    async handleFinished(request: RequestWithRelations, user: GenerateTokenDto){
      //validate current status - can only transition to FINISHED from IN_PROGRESS
      if (request.status !== Status.IN_PROGRESS) {
        throw new BadRequestException(`Can only set to FINISHED from IN_PROGRESS status (current: ${request.status})`);
      }

      if(request.followupService){
        throw new BadRequestException('This request has a follow-up service, only request without follow-up can be set to FINISHED');
      }

      //validate role
      if (user.role !== Role.WORKER) {
        throw new ForbiddenException('Only workers can mark a request as finished');
      }
      
      //check if this worker is authorized to change this request
      if (!this.isWorkerAssignedToRequest(request, user.id)) {
          throw new ForbiddenException('You are not assigned to this request');
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.FINISHED },
      });
    }

    async handleInvoiced(request: RequestWithRelations, user: GenerateTokenDto){
      //validate current status - can only transition to INVOICED from IN_PROGRESS
      if (request.status !== Status.IN_PROGRESS) {
        throw new BadRequestException(`Can only set to INVOICED from FINISHED status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.WORKER) {
        throw new ForbiddenException('Only workers can mark a request as invoiced');
      }
      
      //check if this worker is authorized to change this request
      if (!this.isWorkerAssignedToRequest(request, user.id)) {
        if (request.followupService) {
          throw new ForbiddenException('This request has a follow-up service. Only follow-up workers can change its status.');
        } else {
          throw new ForbiddenException('You are not assigned to this request');
        }
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.INVOICED },
      });
    }

    async handlePaid(request: RequestWithRelations, user: GenerateTokenDto){
      //validate current status - can only transition to PAID from INVOICED
      if (request.status !== Status.INVOICED) {
        throw new BadRequestException(`Can only set to PAID from INVOICED status (current: ${request.status})`);
      }

      //validate role
      if (user.role !== Role.CUSTOMER) {
        throw new ForbiddenException('Only customers can mark a request as paid');
      }
      
      //ensure the customer owns this request
      if (request.customerId !== user.id) {
        throw new ForbiddenException('You can only mark your own requests as paid');
      }
      
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.PAID },
      });
    }

    //validates date and returns date as date object
    validateDate(date: string) {
      //validate date is in correct format
      const validDate = this.isValidDDMMYYYYFormat(date)
      if(!validDate){
        throw new BadRequestException(`Wrong date format for the date: ${date}, should be: DD/MM/YYYY`);
      }

      //valdiate date's time is after current time and not after 30 days
      const requestDate = this.toDDMMYYYY(date).date //returns date object
      if(isBefore(requestDate, startOfDay(new Date()))) { //compare from start of day so that booking in the same day works
        throw new BadRequestException(`Can't edit schedule or make request in the past: ${date}`);
      }
      if(isAfter(requestDate, addDays(new Date(), 30))) {
        throw new BadRequestException(`Too far in the future: ${date}`);
      }
      
      return requestDate
    }

    //returns a date object and a string in the needed format
    //assumes "DD/MM/YYYY" format 
    toDDMMYYYY(dateInput: Date | string): { date: Date; formatted: string; } 
    {
      let dateObj
      if (typeof dateInput === 'string') {
        //split "DD/MM/YYYY"
        const [d, m, y] = dateInput.split('/').map(Number);
        //create 00:00 **UTC** (months 0-based)
        dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
      } 
      else 
      {
        //already a Date: snap to UTC midnight
        dateObj = new Date(Date.UTC(
          dateInput.getUTCFullYear(),
          dateInput.getUTCMonth(),
          dateInput.getUTCDate(),
          0, 0, 0,
        ));
      }
    
      return {
        date: dateObj,
        formatted: format(dateObj, 'dd/MM/yyyy')
      };
    }

    isValidDDMMYYYYFormat(dateStr: string): boolean {
      //format: DD/MM/YYYY
      const regex = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[0-2])[/](\d{4})$/;
      if (!regex.test(dateStr)) return false;
    
      //check if real date
      const [day, month, year] = dateStr.split('/').map(Number);
      const parsed = new Date(year, month - 1, day);
      return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
      );
    }

    async scheduleFollowupAppointment(requestId: string, date: string, userId: string) {

      //1- Basic checks

      //validate the request exists and has a follow-up service
      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
        include: {
          service: {
            include: { 
              serviceProvider: true,
              category: true
            }
          },
          followupService: true,
          customer: true,
          location: true
        }
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (!request.followupService) {
        throw new BadRequestException('This request does not have a follow-up service');
      }

      //verify the request belongs to the customer
      if (request.customerId !== userId) {
        throw new ForbiddenException('You do not have permission to schedule this follow-up appointment');
      }

      //verify the request is in the correct state
      if (request.status !== Status.FINISHED) {
        throw new BadRequestException('Cannot schedule follow-up for a request that is not in FINISHED state');
      }

      //validate and format the date
      const requestDate = this.validateDate(date);

      //doesnt matter which service id we use because we are using the same function for both services and followup services
      const serviceId = request.service.id;

      //2- Check if date is available
      const blockedDates  = await this.serviceService.getSchedule(serviceId, request.location.city);
      
      if(blockedDates.includes(format(requestDate, 'dd/MM/yyyy'))){
        throw new BadRequestException("This service is closed for that day");
      }

      const providerId = request.service.serviceProviderId
      const providerDay = await this.prisma.providerDay.upsert({
        where: {
          date_serviceProviderId: {
            date: requestDate,              
            serviceProviderId: providerId,
          },
        },
        update: {},
        create: {                           
          date: requestDate,
          serviceProviderId: providerId,
          isClosed: false,                  
          isBusy: false,
        },
        include: {
          serviceProvider: true
        }
      });

      //update the request with the follow-up date and change status
      return this.prisma.$transaction(async (tx) => {

        //get workers from the same city as the original request
        const providerWorkers = await tx.worker.findMany({
          where: {
            serviceProviderId: providerId,
          },
          select: { id: true, city: true },
        });

        const city = await this.serviceService.parseCity(request.location.city);
        const providerWorkersByCity = providerWorkers.filter(
          (w) => w.city.name === city
        );

        const dayWorkers = await Promise.all(
          providerWorkersByCity.map((w) =>
            tx.workerDay.upsert({
              where: {
                workerId_providerDayId: 
                { 
                  workerId: w.id, 
                  providerDayId: providerDay.id 
                },
              },
              update: {}, 
              create: {
                workerId: w.id,
                providerDayId: providerDay.id,
                nbOfAssignedRequests: 0,
                capacity: 2,         
              },
              include: {
                worker: true
              }
            }),
          ),
        );

        const availableDayWorkers = dayWorkers.filter(
          (dw) => dw.nbOfAssignedRequests < dw.capacity,
        );

        const neededWorkers = request.followupService!.requiredNbOfWorkers;

        if (availableDayWorkers.length < neededWorkers) {
          throw new BadRequestException('Not enough workers available for this follow-up service in the selected city');
        }

        const chosenWorkers = availableDayWorkers.slice(0, neededWorkers);

        //update the original request
        const updatedRequest = await tx.request.update({
          where: { id: requestId },
          data: {
            status: Status.PENDING,
            followUpProviderDayId: providerDay.id,
            followupDailyWorkers: {
              connect: chosenWorkers.map(dw => ({ id: dw.id }))
            }
          },
          include: {
            service: true,
            followupService: true,
            location: true,
            customer: true,
            dailyWorkers: {
              include: {
                worker: true
              }
            },
            followupDailyWorkers: {
              include: {
                worker: true
              }
            },
            providerDay: true,
            followUpProviderDay: true
          }
        });

        //update counts  
        await Promise.all(
          chosenWorkers.map(worker => 
            tx.workerDay.update({
              where: { id: worker.id },
              data: { nbOfAssignedRequests: { increment: 1 } }
            })
          )
        );
        await tx.providerDay.update({
          where: { id: providerDay.id },
          data: { totalRequestsCount: { increment: 1 } }
        });

        //update schedules
        const updatedDayWorkers = await Promise.all(
          providerWorkers.map((w) =>
            tx.workerDay.upsert(
            {
              where: 
              {
                workerId_providerDayId: 
                {
                  workerId:      w.id,
                  providerDayId: providerDay.id,
                },
              },
              update: {},
              create: 
              {
                workerId:             w.id,
                providerDayId:        providerDay.id,
                nbOfAssignedRequests: 0,
                capacity:             2,
              },
              select: 
              {
                id:                   true,
                workerId:             true,
                nbOfAssignedRequests: true,
                capacity:             true,
              },
            }),
          ),
        );

        //get number of free workers to check if we should close the provider day
        const freeWorkersCount = updatedDayWorkers.filter(dw => dw.nbOfAssignedRequests < dw.capacity).length;
        
        //close entire day for service provider if no workers are left
        if (freeWorkersCount === 0) 
        {
          await tx.providerDay.update({
            where: { id: providerDay.id },
            data: { isBusy: true }
          });

          //close all services for this day
          const services = await tx.service.findMany({
            where: { serviceProviderId: providerId },
            select: { id: true, requiredNbOfWorkers: true },
          });
          await Promise.all(services.map(({ id: svcId }) => 
            tx.serviceDay.upsert(
            { 
              where: 
              {
                serviceId_providerDayId: {
                  serviceId:      svcId,
                  providerDayId:  providerDay.id,
                },
              },
              update: {
                isClosed: true,
              },
              create: {
                serviceId:       svcId,
                providerDayId:   providerDay.id,
                isClosed:        true,
              },
            })
          ));
        }
        //unnecssary code now because every service needs only 1 worker
        // // Otherwise check each service if enough workers are available
        // else 
        // {
        //   const services = await tx.service.findMany({
        //     where: { serviceProviderId: providerId },
        //     select: { id: true, requiredNbOfWorkers: true },
        //   });
          
        //   await Promise.all(
        //     services.map(({ id: svcId, requiredNbOfWorkers }) => {
        //       const shouldClose = freeWorkersCount < requiredNbOfWorkers;
              
        //       return tx.serviceDay.upsert({
        //         where: {
        //           serviceId_providerDayId: {
        //             serviceId:      svcId,
        //             providerDayId:  providerDay.id,
        //           },
        //         },
        //         update: {
        //           isClosed: shouldClose,
        //         },
        //         create: {
        //           serviceId:       svcId,
        //           providerDayId:   providerDay.id,
        //           isClosed:        shouldClose,
        //         },
        //       });
        //     }),
        //   );
        // }      

        return updatedRequest;
      });
    }

    async getRequestById(id: string, user: GenerateTokenDto)
    {
      //Build a where object based on user role and request ID
      const where: any = { id };

      
      switch (user.role) {
        case Role.SERVICE_PROVIDER:
          // The provider is the same for both original and follow-up services
          where.providerDay = {
            is: {
              serviceProviderId: user.id,
            },
          };
          break;
        case Role.CUSTOMER:
          where.customerId = user.id;
          break;
        case Role.WORKER:
          where.OR = [
            { dailyWorkers: { some: { workerId: user.id } } },
            { followupDailyWorkers: { some: { workerId: user.id } } }
          ];
          break;
        case Role.ADMIN:
          break;
        default:
          throw new ForbiddenException('Invalid role');
      }

      const request = await this.prisma.request.findFirst({
        where,
        select: {
          id: true,
          status: true,
          notes: true,
          createdAt: true,
          customer: {
            select: {
              username: true,
              phoneNumber: true
            }
          },
          providerDay: { 
            select: { 
              date: true, 
              serviceProviderId: true 
            } 
          },
          dailyWorkers: { 
            include: { 
              worker: true 
            } 
          },
          service: {
            select: {
              nameAR: true,
              nameEN: true,
              category: true,
              descriptionAR: true,
              descriptionEN: true,
              serviceProvider: true
            }
          },
          location: true,
          followupService: true,
          followupDailyWorkers: {
            include: {
              worker: true
            }
          },
          followUpProviderDay: { 
            select: {
              date: true,
              serviceProviderId: true
            }
          },
          invoiceItems: true,
          feedback: {
            select: {
              rating: true,
              review: true,
              createdAt: true,
            }
          },
          complaint: {
            select: {
              description: true,
              createdAt: true
            }
          }
        },
      });

      if (!request) {
        throw new NotFoundException(`Request with id ${id} not found or you don't have permission to access it`);
      }

      const date = this.toDDMMYYYY((request as any).providerDay?.date).formatted;
          
      //extract needed properties without duplicating 'id'
      const { status, notes } = request;
      
      //calculate total price from invoice items if they exist
      const invoiceItems = (request as any).invoiceItems || [];
      const totalPrice = invoiceItems.reduce((sum: number, item: any) => sum + Number(item.price), 0).toString();
      
      //format invoice data if items exist
      let invoice: { date: string; details: any[] } | null = null;
      if (invoiceItems.length > 0) {
        // Find the most recent invoice item date
        const sortedItems = [...invoiceItems].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestDate = sortedItems[0]?.createdAt 
          ? format(new Date(sortedItems[0].createdAt), 'dd/MM/yyyy') 
          : format(new Date(), 'dd/MM/yyyy');
        
        //format invoice items details
        const details = invoiceItems.map((item: any) => ({
          nameAR: item.nameAR,
          nameEN: item.nameEN,
          price: item.price
        }));
        
        invoice = {
          date: latestDate,
          details
        };
      }

      //extract worker
      //extrat only first element because all services now only have one worker
      const worker = request.dailyWorkers[0]
      const followUpWorker = request.followupDailyWorkers[0]
      
      return {
        id,
        date,
        totalPrice: totalPrice || "NA",
        customer: {
          username: request.customer.username,
          phoneNumber: request.customer.phoneNumber,
        },
        serviceProvider: {
          username: request.service.serviceProvider.username || '',
          usernameAR: request.service.serviceProvider.usernameAR || ''
        },
        location: request.location,
        service: {
          nameAR: request.service.nameAR,
          nameEN: request.service.nameEN,
          category: request.service.category,
          descriptionAR: request.service.descriptionAR,
          descriptionEN: request.service.descriptionEN,
        },
        worker: {
          username: worker.worker.username,
          phonenumber: worker.worker.phoneNumber
        },
        followUpWorker: followUpWorker ? {
          username: followUpWorker.worker.username,
          phonenumber: followUpWorker.worker.phoneNumber
        } : null,
        invoice,
        status,
        notes, 
        followUpService: request.followupService,
        feedback: request.feedback,
        complaint: request.complaint
      };
    }

    async addInvoiceItem(requestId: string, userId: string, addInvoiceItemDto: AddInvoiceItemDto) {
      try {
        const request = await this.prisma.request.findUnique({
          where: { id: requestId },
          include: {
            service: {
              include: {
                serviceProvider: true
              }
            },
            customer: true,
            dailyWorkers: { 
              include: { 
                worker: true 
              } 
            },
            followupService: true,
            followupDailyWorkers: {
              include: {
                worker: true
              }
            }
          }
        });

        if (!request) {
          throw new NotFoundException('Request not found');
        }

        const service = await this.prisma.service.findUnique({
          where: { id: request.serviceId },
          include: { serviceProvider: true }
        });

        if (!service) {
          throw new NotFoundException('Service not found');
        }

        //check permissions
        const user = await this.prisma.serviceProvider.findUnique({
          where: { id: userId }
        });
        const worker = await this.prisma.worker.findUnique({
          where: { id: userId }
        });

        if (!user && !worker) {
          throw new ForbiddenException('Only service providers and workers can add invoice items');
        }

        //if user is service provider, check if request belongs to their service
        if (user && service.serviceProviderId !== userId) {
          throw new ForbiddenException('You can only add invoice items to your own service requests');
        }

        //if user is worker, check if worker is assigned to the request
        if (worker) 
        {
          //for requests with follow-up service, check if the worker is assigned to the follow-up
          if (request.followupService) 
          {
            const isFollowupWorker = request.followupDailyWorkers?.some(
              dw => dw.worker.id === userId
            );
            if (!isFollowupWorker) {
              throw new ForbiddenException('You are not assigned to this follow-up request');
            }
          } 
          else 
          {
            // For regular requests, check if worker is in the daily workers
            const isAssignedWorker = request.dailyWorkers?.some(
              dw => dw.worker.id === userId
            );
            if (!isAssignedWorker) {
              throw new ForbiddenException('You are not assigned to this request');
            }
          }
        }

        //create all invoice items in a transaction
        await this.prisma.$transaction(
          addInvoiceItemDto.items.map(item => 
            this.prisma.invoiceItem.create({
              data: {
                nameAR: item.nameAR,
                nameEN: item.nameEN,
                price: item.price,
                requestId: requestId
              }
            })
          )
        );

        //get all invoice items
        const invoiceItems = await this.prisma.invoiceItem.findMany({
          where: { requestId }
        });

        return {
          ...request,
          invoiceItems
        };
      } 
      catch (error) {
        throw error;
      }
    }
    
    async addFeedback(requestId: string, userId: string, data: { rating: number, review?: string }) {

      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
        include: {
          service: {
            include: {
              serviceProvider: true,
            },
          },
          feedback: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.customerId !== userId) {
        throw new ForbiddenException('You can only provide feedback for your own requests');
      }

      const allowedStatuses = ['PAID'];
      if (!allowedStatuses.includes(request.status)) {
        throw new BadRequestException('Feedback can only be provided for completed requests');
      }

      if (request.feedback) {
        throw new BadRequestException('Feedback has already been provided for this request');
      }

      const serviceProviderId = request.service.serviceProvider.id;

      const feedback = await this.prisma.requestFeedback.create({
        data: {
          rating: data.rating,
          review: data.review,
          request: { connect: { id: requestId } },
          serviceProvider: { connect: { id: serviceProviderId } },
        },
      });

      //update the service provider's average rating
      await this.updateServiceProviderRating(serviceProviderId);

      return feedback;
    }

    /**
     * Calculate and update the average rating for a service provider
     */
    private async updateServiceProviderRating(serviceProviderId: string) {
      
      //get all feedbacks for the service provider
      const feedbacks = await this.prisma.requestFeedback.findMany({
        where: { serviceProviderId },
        select: { rating: true },
      });

      if (feedbacks.length > 0) {
        const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
        
        await this.prisma.serviceProvider.update({
          where: { id: serviceProviderId },
          data: { avgRating },
        });

        return avgRating;
      }

      return null;
    }

    /**
     * Add a complaint for a request
     */
    async addComplaint(requestId: string, userId: string, data: { description: string }) {

      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
        include: {
          service: {
            include: {
              serviceProvider: true,
            },
          },
          complaint: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.customerId !== userId) {
        throw new ForbiddenException('You can only provide complaints for your own requests');
      }

      if (request.complaint) {
        throw new BadRequestException('A complaint has already been submitted for this request');
      }

      const serviceProviderId = request.service.serviceProvider.id;

      const complaint = await this.prisma.complaint.create({
        data: {
          description: data.description,
          request: { connect: { id: requestId } },
          serviceProvider: { connect: { id: serviceProviderId } },
        },
      });

      return complaint;
    }
}
