import { ApiProperty } from '@nestjs/swagger';

export class ServicesResultDto {
    @ApiProperty({
        description: 'Service ID',
        example: 'service-uuid',
        type: 'string'
    })
    serviceId: number;

    @ApiProperty({
        description: 'Service name in English',
        example: 'Plumbing Service',
        type: 'string'
    })
    nameEN: string;

    @ApiProperty({
        description: 'Service name in Arabic',
        example: 'خدمة السباكة',
        type: 'string'
    })
    nameAR: string;

    @ApiProperty({
        description: 'Category ID for the service',
        example: 1,
        type: 'number'
    })
    categoryId: number;

    @ApiProperty({
        description: 'Service price',
        example: '100',
        type: 'string'
    })
    price: number;

    @ApiProperty({
        description: 'Service provider ID',
        example: 'provider-uuid',
        type: 'string'
    })
    providerId: number;

    @ApiProperty({
        description: 'Service provider name',
        example: 'serviceCompany',
        type: 'string'
    })
    providerName: string;
}