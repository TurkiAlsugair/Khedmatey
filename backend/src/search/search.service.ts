import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ServicesResultDto } from './dto/services-reult.dto';
import { ProvidersResultDto } from './dto/providers-result.dto';

@Injectable()
export class SearchService {
    constructor(private prisma: DatabaseService){}

    //search for service or providers
    async search(searchTerm: string, city: string) : Promise<{
         services: ServicesResultDto[];
         providers: ProvidersResultDto[];
       }> {
        
        let services: ServicesResultDto[] = [];
        let providers: ProvidersResultDto[] = [];

        if (city) {
          //search for services
          services = await this.prisma.$queryRaw<ServicesResultDto[]>`
            SELECT 
              s.id AS serviceId,
              s.nameEN,
              s.nameAR,
              s.descriptionEN,
              s.descriptionAR,
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
              AND sp.id IN (
                SELECT sp_city.B
                FROM City c
                JOIN _CityToServiceProvider sp_city ON c.id = sp_city.A
                WHERE c.name = ${city}
              )
            ORDER BY
              CASE
                WHEN s.nameEN LIKE CONCAT(${searchTerm}, '%') OR s.nameAR LIKE CONCAT(${searchTerm}, '%') THEN 1
                WHEN s.nameEN LIKE CONCAT('% ', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
                WHEN s.nameEN LIKE CONCAT('%', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
              END
          `;

          //search for providers
          providers = await this.prisma.$queryRaw<ProvidersResultDto[]>`
            SELECT id, username, usernameAR, phoneNumber, avgRating
            FROM ServiceProvider
            WHERE status = 'ACCEPTED'
            AND (
              username LIKE CONCAT('%', ${searchTerm}, '%') OR
              usernameAR LIKE CONCAT('%', ${searchTerm}, '%')
            )
            AND id IN (
              SELECT sp_city.B
              FROM City c
              JOIN _CityToServiceProvider sp_city ON c.id = sp_city.A
              WHERE c.name = ${city}
            )
            ORDER BY
              CASE
                WHEN username LIKE CONCAT(${searchTerm}, '%') OR usernameAR LIKE CONCAT(${searchTerm}, '%') THEN 1
                WHEN username LIKE CONCAT('% ', ${searchTerm}, '%') OR usernameAR LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
                WHEN username LIKE CONCAT('%', ${searchTerm}, '%') OR usernameAR LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
              END
          `;
        }  
        return {
          services,
          providers,
        };
      }
}
