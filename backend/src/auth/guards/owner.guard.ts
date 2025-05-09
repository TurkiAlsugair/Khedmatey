import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
  
  /**
   * Guard to ensure that the user is only accessing or modifying their own data.
   * It compares the phoneNumber in the JWT payload with the one in the request body.
   */
  @Injectable()
  export class OwnerGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
      const req = ctx.switchToHttp().getRequest();
      const user = req.user;
      const { id } = req.params;
      
      if (!id || user.id !== id) {
        throw new ForbiddenException('You may only modify your own account');
      }
      return true;
  
    }
  }
  