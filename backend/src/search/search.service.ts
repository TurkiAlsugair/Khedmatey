import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ServicesResultDto } from './dto/services-reult.dto';
import { ProvidersResultDto } from './dto/providers-result.dto';

@Injectable()
export class SearchService {
    constructor(private prisma: DatabaseService){}

    //search for service or providers
    async search(searchTerm: string) : Promise<{
         services: ServicesResultDto[];
         providers: ProvidersResultDto[];
       }> {
        //search for services that match the search term and return them ordered by most matching
        const services = await this.prisma.$queryRaw<ServicesResultDto[]>`
          SELECT 
            s.id AS serviceId,
            s.nameEN,
            s.nameAR,
            s.categoryId,
            s.price,
            sp.id AS providerId,
            sp.username AS providerName
          FROM Service s
          JOIN ServiceProvider sp ON s.serviceProviderId = sp.id
          WHERE s.status = 'ACCEPTED' AND sp.status = 'ACCEPTED'
            AND (
              s.nameEN LIKE CONCAT('%', ${searchTerm}, '%') OR
              s.nameAR LIKE CONCAT('%', ${searchTerm}, '%')
            )
          ORDER BY
            CASE
              WHEN s.nameEN LIKE CONCAT(${searchTerm}, '%') OR s.nameAR LIKE CONCAT(${searchTerm}, '%') THEN 1
              WHEN s.nameEN LIKE CONCAT('% ', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
              WHEN s.nameEN LIKE CONCAT('%', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
            END
        `; 
          //from line 32 to 35 is to make sure only matched results is returned for either arabic or english names
          //from LINE 36 TO 42 this is to order the returned values based on most mathcing          
      
        //search for services that match the search term and return them ordered by most matching
        const providers = await this.prisma.$queryRaw<ProvidersResultDto[]>`
          SELECT id, username, phoneNumber
          FROM ServiceProvider
          WHERE status = 'ACCEPTED'
          AND username LIKE CONCAT('%', ${searchTerm}, '%')
      
          ORDER BY
            CASE
              WHEN username LIKE CONCAT(${searchTerm}, '%') THEN 1
              WHEN username LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
              WHEN username LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
            END
        `;
        //from line 52 to 55 is to make sure only matched results is returned
        //from LINE 56 TO 62 this is to order the returned values based on most mathcing          
        return {
          services,
          providers,
        };
      }
}
