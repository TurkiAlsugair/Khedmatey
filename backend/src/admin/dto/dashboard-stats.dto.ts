import { ApiProperty } from '@nestjs/swagger';

type StatusCountDto = Record<string, number>;

class ServiceProvidersStatsDto {
  @ApiProperty({ example: 50, description: 'Total number of service providers' })
  total: number;

  @ApiProperty({
    description: 'Service providers count grouped by status',
    example: { PENDING: 5, ACCEPTED: 45 }
  })
  byStatus: StatusCountDto;
}

class CustomersStatsDto {
  @ApiProperty({ example: 100, description: 'Total number of customers' })
  total: number;
}

class ServicesStatsDto {
  @ApiProperty({ example: 200, description: 'Total number of services' })
  total: number;

  @ApiProperty({
    description: 'Services count grouped by status',
    example: { PENDING: 20, ACCEPTED: 180 }
  })
  byStatus: StatusCountDto;
}

class RequestsStatsDto {
  @ApiProperty({ example: 300, description: 'Total number of requests' })
  total: number;

  @ApiProperty({
    description: 'Requests count grouped by status',
    example: { PENDING: 30, ACCEPTED: 100, FINISHED: 170 }
  })
  byStatus: StatusCountDto;
}

class WorkersStatsDto {
  @ApiProperty({ example: 150, description: 'Total number of workers' })
  total: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: ServiceProvidersStatsDto })
  serviceProviders: ServiceProvidersStatsDto;

  @ApiProperty({ type: CustomersStatsDto })
  customers: CustomersStatsDto;

  @ApiProperty({ type: ServicesStatsDto })
  services: ServicesStatsDto;

  @ApiProperty({ type: RequestsStatsDto })
  requests: RequestsStatsDto;

  @ApiProperty({ type: WorkersStatsDto })
  workers: WorkersStatsDto;
} 