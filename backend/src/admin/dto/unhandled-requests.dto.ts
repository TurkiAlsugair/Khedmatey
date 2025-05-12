import { Status } from '@prisma/client';

export class RequestDetailsDto {
  id: string;
  status: Status;
  createdAt: Date;
  date: string;
  notes?: string;
  serviceId: string;
  serviceName: string;
  locationId: string;
  locationDetails: {
    city: string;
    fullAddress: string;
    miniAddress: string;
    lat: number;
    lng: number;
  };
  scheduledDate: Date;
  customerId: string;
  customerName: string;
  customerPhone: string;
}

export class ServiceProviderRequestsDto {
  serviceProviderId: string;
  serviceProviderName: string;
  serviceProviderPhone: string;
  serviceProviderEmail: string;
  requests: RequestDetailsDto[];
}

export class AllUnhandledRequestsResponseDto {
  serviceProviders: ServiceProviderRequestsDto[];
}

