import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { Role, Status } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateRequestStatusDto } from './dtos/update-status.dto';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    async createRequest(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
    {
      try 
      {
        const createdRequest = await this.requestService.createRequest(createRequestDto, user.id);
        return {
          message: 'Request created successfully',
          data: createdRequest,
        };
      } 
      catch (err) {
        throw err;
      }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: GenerateTokenDto, @Body() dto: UpdateRequestStatusDto): Promise<BaseResponseDto> {
      try
      {
        const data = await this.requestService.updateStatus(id, user, dto.status);
        return { message: 'Status updated', data };
      }
      catch(error){
        throw error
      }
    }

    @UseGuards(JwtAuthGuard)
    @Get() 
    async getRequests(@CurrentUser() user: GenerateTokenDto, @Query('status') status?: Status): Promise<BaseResponseDto> {
      try
      {
        const data = await this.requestService.getRequests(user, status);
        return { message: 'Requests fetched', data };
      }
      catch(err){
        throw err
      }
    }

}
