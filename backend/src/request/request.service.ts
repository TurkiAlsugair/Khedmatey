import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dtos/create-request.dto';
import { DatabaseService } from 'src/database/database.service';
import { CityName, Status, Request, Customer, Role } from '@prisma/client';
import { isBefore, isAfter, addDays, format, startOfDay } from 'date-fns';
import { ServiceService } from 'src/service/service.service';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { error } from 'console';

@Injectable()
export class RequestService {
  
    constructor(private prisma: DatabaseService, private serviceService: ServiceService) {}

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

        //get provider
        const providerId = service.serviceProviderId;

        //validate date
        const requestDate = this.validateDate(date)

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
        const closedServiceDates = await this.serviceService.getServiceSchedule(serviceId, location.city as CityName)
        if(closedServiceDates.includes(format(requestDate, 'yyyy-MM-dd'))){
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
            (w) => w.city.name === (location.city as CityName)
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
            include: 
            {
              dailyWorkers: 
              {
                select: 
                {
                  id: true,
                  workerId: true,
                }
              },
              location: true,
              providerDay:
              {
                select: 
                {
                  id: true,
                  date: true,
                }
              }
            }
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

          //other wise, check every service if enouph workers are available for it, else, close it for the day.
          //this does not check the avaialbity of a service based on city, that happens on the getService function of the service
          else 
          {
            const services = await tx.service.findMany({
              where: { serviceProviderId: providerId },
              select: { id: true, requiredNbOfWorkers: true },
            });
            
            await Promise.all(
              services.map(({ id: svcId, requiredNbOfWorkers }) => {
                const shouldClose = freeWorkersCount < requiredNbOfWorkers;
                
                return tx.serviceDay.upsert({
                  where: {
                    serviceId_providerDayId: {
                      serviceId:      svcId,
                      providerDayId:  providerDay.id,
                    },
                  },
                  update: {
                    isClosed: shouldClose,
                  },
                  create: {
                    serviceId:       svcId,
                    providerDayId:   providerDay.id,
                    isClosed:        shouldClose,
                  },
                });
              }),
            );
          }      
          return newRequest;
        });

    }

    /*
    returns the requests that belongs to the requester.
    if no status filter provided, returns requests filtered by status, otherwise return one array of requests.
    */
    async getRequests(
      user: GenerateTokenDto,status?: Status): Promise<Request[] | Record<Status, Request[]>> {

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
      if (status) {
        where.status = status;
      }
  
      //3- fetch with all relevant relations
      const requests = await this.prisma.request.findMany({
        where,
        include: {
          customer: true,
          providerDay: { select: { date: true, serviceProviderId: true } },
          dailyWorkers: { include: { worker: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
  
      //4- Run auto-cancel on all pending requests
      const now = Date.now();
      const updatedRequests = await Promise.all(
        requests.map(async (req) => {
          if (req.status === Status.PENDING) {
            await this.autoCancel(req, now);
            // Refresh the request after possible status change
            return this.prisma.request.findUnique({
              where: { id: req.id },
              include: {
                customer: true,
                providerDay: { select: { date: true, serviceProviderId: true } },
                dailyWorkers: { include: { worker: true } },
              },
            });
          }
          return req;
        })
      );

      // Filter out any null values (shouldn't happen, but just in case)
      const filteredRequests = updatedRequests.filter(req => req !== null) as Request[];
  
      //5- if specific status, return requests as is 
      if (status) {
        return filteredRequests;
      }
  
      //6- otherwise group by status
      const grouped = Object.values(Status).reduce((acc, s) => {
        acc[s] = [];
        return acc;
      }, {} as Record<Status, Request[]>);
  
      for (const req of filteredRequests) {
        grouped[req.status].push(req);
      }
      return grouped;
    }

    async updateStatus(id: string, user: GenerateTokenDto, newStatus: Status) {

      const request = await this.prisma.request.findUnique({ 
        where: { id },
        include: {
          providerDay: { select: { serviceProviderId: true } },
          customer: true,
          dailyWorkers: { include: { worker: true } },
        },
      });
      const serviceProviderId = request?.providerDay.serviceProviderId

      if (!request) {
        throw new NotFoundException(`Request with id ${id} not found`);
      }
      
      let result: Request 
      switch (newStatus) 
      {
        case Status.ACCEPTED:
          result = await this.handleAccepted(request, user, serviceProviderId as string);
          break;

        case Status.DECLINED:
          result = await this.handledDeclined(request, user, serviceProviderId as string);
          break;
        
        default:
          throw new BadRequestException("Unknown status")
      }

      return result
    }

    //returns true and update request's status to cancelled if it has been created for more than 10 min, otherwise return false.
    private async autoCancel(request: Request, nowMs: number): Promise<boolean> {
      const tenMinutesMs = 10 * 60 * 1000;
      const age = nowMs - request.createdAt.getTime();

      if(request.status !== Status.PENDING){
        return false
      }

      if (age > tenMinutesMs) {
        await this.prisma.request.update({
          where: { id: request.id },
          data: { status: Status.CANCELED },
        });
        return true;
      }
      return false;
    }

    async handleAccepted(request: Request, user: GenerateTokenDto, serviceProviderId: string){

      if (user.role !== Role.SERVICE_PROVIDER) {
        throw new ForbiddenException('Only service providers may accept');
      }
      if (serviceProviderId !== user.id) {
        throw new ForbiddenException(
          'You can only accept requests assigned to your services',
        );
      }
      
      if (await this.autoCancel(request, Date.now())) {
        throw new ForbiddenException(
          'Request automatically cancelled due to time limit',
        );
      }
  
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.ACCEPTED },
      });
    }

    async handledDeclined(request: Request, user: GenerateTokenDto, serviceProviderId: string){
      if (user.role !== Role.SERVICE_PROVIDER) {
        throw new ForbiddenException('Only service providers may accept');
      }
      if (serviceProviderId !== user.id) 
      {
        throw new ForbiddenException(
          'You can only decline requests assigned to your services',
        );
      }

      if (await this.autoCancel(request, Date.now())) {
        throw new ForbiddenException(
          'Request automatically cancelled due to time limit',
        );
      }
  
      return this.prisma.request.update({
        where: { id: request.id },
        data: { status: Status.DECLINED },
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
        throw new BadRequestException(`Cant edit schedule or make request in the past: ${date}`);
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
}
