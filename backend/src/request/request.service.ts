import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dtos/create-request.dto';
import { DatabaseService } from 'src/database/database.service';
import { CityName } from '@prisma/client';
import { Status } from '@prisma/client';
import { isBefore, isAfter, addDays, format } from 'date-fns';

@Injectable()
export class RequestService {

    constructor(private prisma: DatabaseService) {}

    async createRequest(createRequestDto: CreateRequestDto, userId: number) 
    {
        const { serviceId, customerId, notes, location, date } = createRequestDto;

        //Basic checks --------------

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

        //validate date is in correct format
        const validDate = this.isValidDDMMYYYYFormat(date)
        if(!validDate){
          throw new BadRequestException('Wrong date format');
        }

        //valdiate date's time is after current time and not after 30 days
        const requestDate = this.toDDMMYYYY(date).date
  
        if(isBefore(requestDate, new Date())) {
            throw new BadRequestException('Cannot create requests in the past');
        }
        if(isAfter(requestDate, addDays(new Date(), 30))) {
          throw new BadRequestException('Too far in the future');
        }

        //extract city from given location

        //validate location is within provider's cities
        const providerCities = await this.prisma.city.findMany({
            where: {
                providers: {
                    some: { id: providerId }
                }
            }
        });

        //extract cities's names to compare with provided location
        const cityNames = providerCities.map(c => c.name as string); //cast enum to string
        if (!cityNames.includes(location.city)) {
            throw new BadRequestException('Location not served by this provider');
        }
        
        //Check if date is available ---------------------

        //check ProviderDay, if not exists, create it (not existing means it is available)
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

        //return if day isnt available 
        if (providerDay.isClosed || providerDay.isBusy) {
            throw new BadRequestException('Day is closed for the provider');
        }

        //check availability of service (day of provider might be available but a specific service might not be)
        //if not exist create it
        const providerDayService = await this.prisma.providerDayService.upsert({
          where: {
            serviceId_providerDayId: {
              providerDayId: providerDay.id,
              serviceId:     serviceId,
            },
          },
          update: {},
          create: {                        
            providerDayId:   providerDay.id,
            serviceId:       serviceId,
            isClosed: false,                             
          },
        });
        
        if (providerDayService.isClosed) {
          throw new BadRequestException('This service is closed for that day');
        }

        //Create new request -------------------
        return this.prisma.$transaction(async (tx) => {

            //get number of workers needed
            const neededWorkers = service.requiredNbOfWorkers;
      
            //find available workers in that day, who also match the location
            //(each Worker belongs to exactly 1 city)
            const dayWorkers = await tx.providerDayWorker.findMany({
              where: {
                providerDayId: providerDay.id,
                nbOfAssignedRequests: { lt:  tx.providerDayWorker.fields.capacity }, //check if worker have capacity left
                worker: {
                  city: {
                    name: location.city as CityName
                  }
                }
              },
              include: {
                worker: true
              }
            });
      
            //if not enough workers, close the service for that day, and throw. 
            //(this should not happen because the service will be already closed from before and wouldnt have reached this code)
            if (dayWorkers.length < neededWorkers) {
              await tx.providerDayService.update({
                where: { id: providerDayService.id },
                data: { isClosed: true }
              });
              throw new BadRequestException('Not enough workers available for this service in the selected city');
            }
      
            //pick workers to work on the request
            //could have some kind of logic but not needed for now
            const chosenWorkers = dayWorkers.slice(0, neededWorkers);

            //create location if not exists
            const loc = await tx.location.upsert({
              where: {
                fullAddress: location.fullAddress,       
              },
              update: {},
              create: {                                  
                city:         location.city,
                fullAddress:  location.fullAddress,
                miniAddress:  location.miniAddress,
                lat:          location.lat,
                lng:          location.lng,
              },
            });
      
            //Create the Request
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
              include: {
                dailyWorkers: true,
                location:     true
              }
            });
      
            //increment nb of assigned requests for each workerDay
            for (const cw of chosenWorkers) {
              await tx.providerDayWorker.update({
                where: { id: cw.id },
                data: { nbOfAssignedRequests: { increment: 1 } }
              });
            }
      
            //Update schedules --------------------------------------------
      
            //check how many workers remain free on this day (based on if they have enouph capacity to get more requests)
            const allDayWorkers = await tx.providerDayWorker.findMany({
              where: { providerDayId: providerDay.id }
            });
            const freeWorkersCount = allDayWorkers.filter(dw => dw.nbOfAssignedRequests < dw.capacity).length;
      
            //close entire day for service provider if no workers are left
            if (freeWorkersCount === 0) 
            {
              await tx.providerDay.update({
                where: { id: providerDay.id },
                data: { isClosed: true }
              });
            }
            //other wise, check every service if enouph workers are available for it, else, close it for the day.
            else 
            {
              const dayServices = await tx.providerDayService.findMany({
                where: { providerDayId: providerDay.id },
                include: {
                    service: {
                      select: {
                        requiredNbOfWorkers: true,
                      },
                    },
                },
              });
      
              for (const ds of dayServices) {
                if (freeWorkersCount < ds.service.requiredNbOfWorkers) {
                  await tx.providerDayService.update({
                    where: { id: ds.id },
                    data: { isClosed: true }
                  });
                }
              }
            }
      
            // Return the newly created request
            return newRequest;
        });

    }

    //returns a date object and a string in the needed format
    toDDMMYYYY(dateInput: Date | string): { date: Date; formatted: string; } 
    {
      const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
      const formatted = format(dateObj, 'dd/MM/yyyy');
    
      return {
        date: dateObj,
        formatted,
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
