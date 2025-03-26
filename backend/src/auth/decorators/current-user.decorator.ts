import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GenerateTokenDto } from '../dtos/generate-token.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): GenerateTokenDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
