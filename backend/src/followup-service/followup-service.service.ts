import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateFollowupServiceDto } from 'src/followup-service/dtos/create-followup-service.dto';
import { RequestService } from 'src/request/request.service';
import { Status } from '@prisma/client';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';

@Injectable()
export class FollowupServiceService {
  constructor(
    private prisma: DatabaseService,
    private requestService: RequestService
  ) {}

  async createFollowupService(dto: CreateFollowupServiceDto, user: GenerateTokenDto) {
    const { requestId, nameAR, nameEN, descriptionAR, descriptionEN, categoryId, price, requiredNbOfWorkers = 1, notes } = dto;

    //validate the request exists
    const originalRequest = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        service: {
          include: {
            category: true,
            serviceProvider: true,
          }
        },
        customer: true,
        followupService: true,
        dailyWorkers: {
          include: {
            worker: true
          }
        }
      }
    });

    if (!originalRequest) {
      throw new NotFoundException('Original request not found');
    }

    //check if the worker is assigned to this request
    const isWorkerAssigned = originalRequest.dailyWorkers.some(dw => dw.worker.id === user.id);
    if (!isWorkerAssigned) {
      throw new ForbiddenException('You are not assigned to this request');
    }

    //check if the request already has a follow-up service
    if (originalRequest.followupService) {
      throw new BadRequestException('This request already has a follow-up service');
    }

    //validate the category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    //create the follow-up service
    const followupService = await this.prisma.followupService.create({
      data: {
        nameAR,
        nameEN,
        descriptionAR,
        descriptionEN,
        price,
        requiredNbOfWorkers,
        category: {
          connect: { id: categoryId },
        },
        request: {
          connect: { id: requestId },
        }
      },
      include: {
        category: true,
        request: {
          include: {
            service: true,
            customer: true,
          }
        }
      }
    });

    //IN_PROGRESS -> FINISHED means has a followup service
    this.requestService.updateStatus(requestId, user, Status.FINISHED);

    return {
      followupService,
    };
  }
} 