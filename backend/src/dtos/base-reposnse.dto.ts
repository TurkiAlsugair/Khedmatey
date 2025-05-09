import { ApiProperty } from "@nestjs/swagger";

export class BaseResponseDto <T = any> {
    @ApiProperty({
      description: 'Response message',
      example: 'Operation completed successfully'
    })
    message: string;
  
    @ApiProperty({
      description: 'Response data',
      example: {},
      required: false
    })
    data?: T;
  
    @ApiProperty({
      description: 'Error details (if any)',
      example: null,
      required: false
    })
    error?: any;
  }
  