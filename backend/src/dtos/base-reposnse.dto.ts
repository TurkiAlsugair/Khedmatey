export class BaseResponseDto <T = any> {
    message: string;
    data?: T;
    error?: any;
  }
  