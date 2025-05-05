import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { ServicesResultDto } from "./dto/services-reult.dto";
import { ProvidersResultDto } from "./dto/providers-result.dto";

@Injectable()
export class SearchService {
  constructor(private prisma: DatabaseService) {}

  //search for service or providers
  async search(
    searchTerm: string,
    city: string
  ): Promise<{
    services: ServicesResultDto[];
    providers: ProvidersResultDto[];
  }> {
    //search for services that match the search term and return them ordered by most matching
    let services = await this.prisma.$queryRaw<any[]>`
        SELECT 
        s.id AS serviceId, s.nameEN, s.nameAR, s.categoryId, s.price,s.serviceProviderId, 
        c.name AS categoryName,
        sp.id AS providerId, sp.username, sp.phoneNumber, sp.email, sp.status AS providerStatus
      FROM Service s
      JOIN ServiceProvider sp ON s.serviceProviderId = sp.id
      JOIN _CityToServiceProvider csp ON csp.B = sp.id
      JOIN City city ON city.id = csp.A
      JOIN Category c ON c.id = s.categoryId
    WHERE 
      s.status = 'ACCEPTED'
      AND sp.status = 'ACCEPTED'
      AND city.name = ${city}
      AND (
        s.nameEN LIKE CONCAT('%', ${searchTerm}, '%') OR
        s.nameAR LIKE CONCAT('%', ${searchTerm}, '%')
      )
    ORDER BY
      CASE
        WHEN s.nameEN LIKE CONCAT(${searchTerm}, '%') OR s.nameAR LIKE CONCAT(${searchTerm}, '%') THEN 1
        WHEN s.nameEN LIKE CONCAT('% ', ${searchTerm}, '%') OR s.nameAR LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
        ELSE 3
      END;
  `;
    //from line 33 to 35 is to make sure only matched results is returned for either arabic or english names
    //from LINE 37 TO 42 this is to order the returned values based on most mathcing

    //search for services that match the search term and return them ordered by most matching
    const providers = await this.prisma.$queryRaw<ProvidersResultDto[]>`
          SELECT sp.id, sp.username, sp.phoneNumber, sp.email
          FROM ServiceProvider sp
          JOIN _CityToServiceProvider csp ON csp.B = sp.id
          JOIN City c ON c.id = csp.A
        WHERE
          sp.status = 'ACCEPTED'
          AND c.name = ${city}                                 
          AND sp.username LIKE CONCAT('%', ${searchTerm}, '%')
        ORDER BY
          CASE
            WHEN sp.username LIKE CONCAT(${searchTerm}, '%') THEN 1
            WHEN sp.username LIKE CONCAT('% ', ${searchTerm}, '%') THEN 2
            WHEN sp.username LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
            ELSE 4
          END;
      `;
    //line 53 to 56 is to make sure only matched results is returned
    //from LINE 57 TO 63 this is to order the returned values based on most mathcing
    services = services.map((service) => ({
      id: service.serviceId,
      nameEN: service.nameEN,
      nameAR: service.nameAR,
      categoryId: service.categoryId,
      price: service.price,
      serviceProviderId: service.serviceProviderId,
      category: {
        id: service.categoryId,
        name: service.categoryName,
      },
      serviceProvider: {
        id: service.providerId,
        username: service.username,
        phoneNumber: service.phoneNumber,
        email: service.email,
      },
    }));
    return {
      services,
      providers,
    };
  }
}
