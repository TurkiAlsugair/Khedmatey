import { Status } from "@prisma/client";

export class ServicesResultDto {
  id: number;
  nameEN: string;
  nameAR: string;
  categoryId: number;
  price: string;
  serviceProviderId: number;

  category: {
    id: number;
    name: string;
  };

  serviceProvider: {
    providerId: number;
    username: string;
    phoneNumber: string;
    email: string;
  };

  }