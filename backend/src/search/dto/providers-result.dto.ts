import { ApiProperty } from '@nestjs/swagger';

export class ProvidersResultDto {
    @ApiProperty({
        description: 'Service provider ID',
        example: 'provider-uuid',
        type: 'string'
    })
    id: number;

    @ApiProperty({
        description: 'Service provider username (English)',
        example: 'serviceCompany',
        type: 'string'
    })
    username: string;

    @ApiProperty({
        description: 'Service provider username (Arabic)',
        example: 'شركة الخدمات',
        type: 'string'
    })
    usernameAR: string;

    @ApiProperty({
        description: 'Service provider phone number',
        example: '+123456789',
        type: 'string'
    })
    phoneNumber: string;
}