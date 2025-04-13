import {BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, Status } from '@prisma/client'; // Use the updated enum name
import { DatabaseService } from 'src/database/database.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthService } from '../auth.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class AdminService {

constructor(private prisma: DatabaseService,private twilio: TwilioService, private authService: AuthService ) {}

async signupAdmin({ phoneNumber, username, otpCode }: CreateAdminDto) {

  // Check if the phoneNumber already exists in the system
  const existingUser = await this.authService.findUser({ phoneNumber });

  if (existingUser) {
    throw new ConflictException('Phone number is already registered');
  }

  try {
    // await this.twilio.verifyOtp(phoneNumber, otpCode);
  } catch (err) {
      throw new BadRequestException("Wrong OTP");
  }

  // Create the new admin with role ADMIN
  const role = Role.ADMIN;

  const newAdmin = await this.prisma.admin.create({
    data: { username, phoneNumber, role },
  });

  // Generate token
  const token = this.authService.generateToken(newAdmin);
  return { token, newAdmin };
}

  async updateServiceProviderStatus(spId: number, status: Status) {

    // Find the service provider
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: spId },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    // If already has the status, avoid duplicate update
    if (provider.status === status) {
      throw new BadRequestException(`Provider is already '${status}'`);
    }

    // Update the status
    const updatedProvider = await this.prisma.serviceProvider.update({
      where: { id: spId },
      data: { status },
    });

    return updatedProvider;
  }


  async updateServiceStatus(spId: number, sId: number, status: Status) {

  // Check if the service exists and belongs to the service provider
    const service = await this.prisma.service.findUnique({
      where: { id: sId, serviceProviderId: spId },
    });

    if (!service) {
      throw new NotFoundException("Service not found for this provider");
    }

    // Avoid unnecessary update
    if (service.status === status) {
      throw new BadRequestException(`Service is already ${status}`);
    }

    // Update status
    const updatedService = await this.prisma.service.update({
      where: { id: sId },
      data: { status },
    });

    return { message: `Service status updated to ${status} successfully.` };
  }

  async getPendingProviders() {
    const pendingProviders = await this.prisma.serviceProvider.findMany({
      where: { status: Status.PENDING },
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        email: true,
        cities: {
          select: {
            name: true, // Return only the city name
          },
        },
      },
    });
  
   // Transform `cities` to be an array of strings
  return pendingProviders.map(provider => ({
    ...provider,
    cities: provider.cities.map(city => city.name),
  }));
  }

  // return pending services and its service provider
  async getProvidersPendingServices() {
    const pendingServices = await this.prisma.serviceProvider.findMany({
      
      where: {
        status: Status.ACCEPTED, // return only accepted service providers
        services: {
          some: { //only fetch service providers who have at least one pending service
            status: Status.PENDING, // filters providers with at least 1 pending service
          },
        },
      },
      
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        email: true,
        services: {
          // Only fetch services with status = 'PENDING'
          where: { status: Status.PENDING },
          // Only pick specific fields from each service
          select: {
            id: true,
            categoryId: true,
            nameEN: true,
            nameAR: true,
            price: true,
          },
        },
      },
    });

      // Transform result to match required output
      return pendingServices.map(provider => ({
        id: provider.id,
        username: provider.username,
        phoneNumber: provider.phoneNumber,
        email: provider.email,
        pendingServices: provider.services.map(service => ({
          serviceId: String(service.id),
          categoryId: String(service.categoryId),
          nameEN: service.nameEN,
          nameAR: service.nameAR,
          price: service.price,
        })),
      }));
      }
  }