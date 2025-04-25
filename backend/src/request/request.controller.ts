import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { CreateRequestDto } from './dtos/create-request.dto';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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

}
