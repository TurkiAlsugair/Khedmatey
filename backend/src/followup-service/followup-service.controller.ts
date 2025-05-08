import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FollowupServiceService } from './followup-service.service';
import { CreateFollowupServiceDto } from 'src/followup-service/dtos/create-followup-service.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GenerateTokenDto } from 'src/auth/dtos/generate-token.dto';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('followup-service')
@Controller('followupservice')
export class FollowupServiceController {
  constructor(private readonly followupServiceService: FollowupServiceService) {}

  @ApiOperation({ summary: 'Create follow-up service', description: 'Create a follow-up service for an existing completed request' })
  @ApiBody({ type: CreateFollowupServiceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Follow-up service created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Follow-up service created successfully'
        },
        data: {
          type: 'object',
          properties: {
            followupService: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'followup-uuid' },
                nameAR: { type: 'string', example: 'خدمة متابعة التنظيف' },
                nameEN: { type: 'string', example: 'Cleaning Follow-up Service' },
                price: { type: 'string', example: '150' },
                requestId: { type: 'string', example: 'request-uuid' }
              }
            },
            request: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'request-uuid' },
                status: { type: 'string', example: 'PENDING_BY_C' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data or request not in valid state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to create follow-up for this request' })
  @ApiResponse({ status: 404, description: 'Request or category not found' })
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.WORKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createFollowupService(@Body() createFollowupServiceDto: CreateFollowupServiceDto, @CurrentUser() user: GenerateTokenDto): Promise<BaseResponseDto> 
  {
    try 
    {
      const result = await this.followupServiceService.createFollowupService(createFollowupServiceDto, user);
      
      return {
        message: 'Follow-up service created successfully',
        data: result
      };
    } 
    catch (err) {
      throw err;
    }
  }
} 