import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ServicesResultDto } from './dto/services-reult.dto';
import { ProvidersResultDto } from './dto/providers-result.dto';

@Injectable()
export class SearchService {
    constructor(private prisma: DatabaseService){}

    //search for service or providers
    async search(searchTerm: string, city?: string) : Promise<{
         services: ServicesResultDto[];
         providers: ProvidersResultDto[];
       }> {
        // Search for services that match the search term and return them ordered by most matching
        let services: ServicesResultDto[] = [];
        let providers: ProvidersResultDto[] = [];

        if (city) {
          //city filter
          services = await this.prisma.$queryRaw<ServicesResultDto[]>`
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
              AND sp.id IN (
                SELECT serviceProviderId
                FROM City c
                JOIN _CityToServiceProvider csp ON c.id = csp.A
                WHERE c.name = ${city}
              )
            ORDER BY
              CASE
                WHEN s.nameEN LIKE CONCAT(${searchTerm}, '%') OR s.nameAR LIKE CONCAT(${searchTerm}, '%') THEN 1
                WHEN s.nameEN LIKE CONCAT('% ', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
                WHEN s.nameEN LIKE CONCAT('%', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
              END
          `;

          providers = await this.prisma.$queryRaw<ProvidersResultDto[]>`
            SELECT id, username, phoneNumber
            FROM ServiceProvider
            WHERE status = 'ACCEPTED'
            AND username LIKE CONCAT('%', ${searchTerm}, '%')
            AND id IN (
              SELECT serviceProviderId
              FROM City c
              JOIN _CityToServiceProvider csp ON c.id = csp.A
              WHERE c.name = ${city}
            )
            ORDER BY
              CASE
                WHEN username LIKE CONCAT(${searchTerm}, '%') THEN 1
                WHEN username LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
                WHEN username LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
              END
          `;
        } else {
          // Without city filter - use the original queries
          services = await this.prisma.$queryRaw<ServicesResultDto[]>`
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

          providers = await this.prisma.$queryRaw<ProvidersResultDto[]>`
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
        }
          
        return {
          services,
          providers,
        };
      }
}
