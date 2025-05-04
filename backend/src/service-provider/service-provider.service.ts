import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TwilioService } from 'src/twilio/twilio.service';
import { CreateWorkerDto } from './dtos/create-worker.dto'
import { CityName, Status } from '@prisma/client';
import { addDays, eachDayOfInterval, format, formatISO, startOfDay } from 'date-fns';
import { RequestService } from 'src/request/request.service';


@Injectable()
export class ServiceProviderService {
    constructor( private prisma: DatabaseService, private twilio: TwilioService, private requestService: RequestService){}

    async createWorker(dto: CreateWorkerDto, serviceProviderId: number) {

        //check if phonenumber exists
        const existing = await this.prisma.worker.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (existing) {
          throw new ConflictException('Worker with this phone number already exists');
        }

        //check service provider
        const provider = await this.prisma.serviceProvider.findUnique({
          where: { id: serviceProviderId },
          include: { cities: true },
        });
        if (!provider) {
          throw new NotFoundException(`Service provider not found`);
        }

        const cityName = await this.parseCity(dto.city)

        //find the city by name
        const city = await this.prisma.city.findUnique({
          where: { name: cityName }, 
        });
        if (!city) {
          throw new NotFoundException(`City '${dto.city}' not found`);
        }

        //ensure the city is one of the provider's supported cities
        const providerCityIds = provider.cities.map((c) => c.id);
        if (!providerCityIds.includes(city.id)) {
          throw new BadRequestException(
            `City '${city.name}' is not supported by worker's service provider `
          );
        }

        //verify otp
        // try {
        //   await this.twilio.verifyOtp(phoneNumber, otpCode);
        // } 
        // catch (err) {
        //   throw err;
        // }
      
        //create worker
        const worker = await this.prisma.worker.create({
          data: 
          {
            username: dto.username,
            phoneNumber: dto.phoneNumber,
            serviceProvider: {
              connect: { id: serviceProviderId },
            },
            city: { 
              connect: { id: city.id } 
            },
          },
        });

        //destruct the city id and return the city name instead
        const { cityId, ...rest } = worker;

        return {
          ...rest,
          city: city.name,
        };
    }

    async findProvidersByCity(cityNameStr: string) {
      
      //validate and get the city name by the enum
      const cityEnum = await this.parseCity(cityNameStr)
      
      //get the city
      const city = await this.prisma.city.findUnique({
        where: {
          name: cityEnum,
        },
        include: 
        {
          providers: 
          {
            include: {
              cities: true,
            },
            //only return accepted providers
            where: {
              status: Status.ACCEPTED
            },
          },
        },
      });
  
      //this check is needed because it is already checked using parseCity but it is needed so that city.providers works
      if (!city) {
        throw new NotFoundException(`City '${cityNameStr}' not found`);
      }
  
      //return the providers array
      return city.providers;
    }

    async findAllProviders() {
      return this.prisma.serviceProvider.findMany({
        where: {
          status: Status.ACCEPTED
        },
        include: {
          cities: true
        },
      });
    }

    //returns 2 arrays, blockedDays and busyDays
    async getNext30DaysSchedule(providerId: number) {

      if (isNaN(providerId)) {
        throw new BadRequestException('Invalid provider ID');
      }

      //check if provider exists
      const provider = await this.prisma.serviceProvider.findUnique({
        where: { id: providerId },
      });
      if (!provider) {
        throw new NotFoundException(`Service provider not found`);
      }

      //get today and next 30 days(inclusive)
      const today = startOfDay(new Date());
      const end = addDays(today, 29);
  
      // fetch only rows that actually exist in DB
      const rows = await this.prisma.providerDay.findMany({
        where: {
          serviceProviderId: providerId,
          date: { gte: today, lte: end },
        },
        select: { date: true, isClosed: true, isBusy: true },
      });
      
  
      // quick maps for O(1) lookup, value of true is arbitrary cuz we only care about existence
      const closedMap = new Map(
        rows.filter(r => r.isClosed).map(r => [r.date.toDateString(), true]),
      );
      const busyMap = new Map(
        rows.filter(r => r.isBusy).map(r => [r.date.toDateString(), true]),
      );
  
      const blockedDates: string[] = [];
      const busyDates: string[]    = [];
  
      // iterate through full 30‑day range and check each date against the maps
      eachDayOfInterval({ start: today, end }).forEach(d => {
        const key = d.toDateString();              
        const iso = format(d, 'yyyy-MM-dd');       
  
        if (closedMap.has(key)) blockedDates.push(iso);
        else if (busyMap.has(key)) busyDates.push(iso);
      });
  
      return { blockedDates, busyDates };
    }

    async replaceBlockedDays(providerId: number, newDates: string[],): Promise<string[]> {
      const todayMidnight = startOfDay(new Date());
      const maxRange = addDays(todayMidnight, 30);
  
      //validate date is in correct format and time and return as date object
      const normalizedDates: Date[] = newDates.map((dateStr) =>
        this.requestService.validateDate(dateStr)
      );

      const wantClosedMap: Map<string, Date> = new Map(
        normalizedDates.map((d) => [
          formatISO(d, { representation: 'date' }),
          d,
        ]),
      );

      //close requested dates and open others
      await this.prisma.$transaction(async (tx) => {
        //fetch all providerDay rows in the range
        const existing = await tx.providerDay.findMany({
          where: {
            serviceProviderId: providerId,
            date: { gte: todayMidnight, lte: maxRange },
          },
          select: { id: true, date: true, isClosed: true },
        });
  
      //loop over database rows
      for (const row of existing) 
      {
        const iso = formatISO(row.date, { representation: 'date' });

        //if date exist in want closed dates, close it
        if (wantClosedMap.has(iso)) 
        {
          if (!row.isClosed) {
            await tx.providerDay.update({
              where: { id: row.id },
              data:  { isClosed: true },
            });
          }

          //delete from want closed
          wantClosedMap.delete(iso);
        } 
        //otherwise open it
        else 
        {
          if (row.isClosed) {
            await tx.providerDay.update({
              where: { id: row.id },
              data:  { isClosed: false },
            });
          }
        }
      }
      
      //any keys still in wantClosedMap are new dates → create them closed
      for (const [iso, dateObj] of wantClosedMap) {
        await tx.providerDay.create({
          data: {
            serviceProviderId: providerId,
            date:              dateObj,
            isClosed:          true,
            isBusy:            false,
            totalRequestsCount: 0,
          },
        });
      }

      });
  
      return newDates
    }

    //helper
    async parseCity(cityNameStr: string) {
      //calidate that the string is a valid enum value
      if (!Object.values(CityName).includes(cityNameStr as CityName)) {
        throw new BadRequestException(`Invalid city: ${cityNameStr}`);
      }
      return cityNameStr as CityName;
    }
}
