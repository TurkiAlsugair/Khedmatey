import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BaseResponseDto } from 'src/dtos/base-reposnse.dto';

@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService){}

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
