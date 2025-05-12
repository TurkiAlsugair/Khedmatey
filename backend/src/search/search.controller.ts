import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService){}

    @ApiOperation({ 
      summary: 'Search services and providers', 
      description: 'Search for services and service providers by name' 
    })
    @ApiQuery({ 
      name: 'searchTerm', 
      required: true, 
      description: 'Term to search for in service names and provider names'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Search results retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Search results fetched successfully.'
          },
          data: {
            type: 'object',
            properties: {
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    serviceId: { type: 'string', example: 'service-uuid' },
                    nameEN: { type: 'string', example: 'Plumbing Service' },
                    nameAR: { type: 'string', example: 'خدمة السباكة' },
                    categoryId: { type: 'number', example: 1 },
                    price: { type: 'string', example: '100' },
                    providerId: { type: 'string', example: 'provider-uuid' },
                    providerName: { type: 'string', example: 'serviceCompany' }
                  }
                }
              },
              providers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'provider-uuid' },
                    username: { type: 'string', example: 'serviceCompany' },
                    phoneNumber: { type: 'string', example: '+123456789' }
                  }
                }
              },
              servicesMessage: {
                type: 'string',
                example: 'No services found matching your search.',
                description: 'Message displayed when no services match the search term'
              },
              providersMessage: {
                type: 'string',
                example: 'No service providers found matching your search.',
                description: 'Message displayed when no providers match the search term'
              }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    // @UseGuards(JwtAuthGuard)
    @Get()
    async search(@Query('searchTerm') searchTerm: string): Promise<BaseResponseDto>
    {
        try{
      const { services, providers } = await this.searchService.search(searchTerm.trim());
  
      const response = {
        message: 'Search results fetched successfully.',
        services,
        providers,
      };
  
      if (services.length === 0) {
        response['servicesMessage'] = 'No services found matching your search.';
      }
  
      if (providers.length === 0) {
        response['providersMessage'] = 'No service providers found matching your search.';
      }
  
      return response;
    }
    catch(err){
        throw err;
    }
    }
}
