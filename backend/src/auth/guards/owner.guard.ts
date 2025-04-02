import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
  
  /**
   * Guard to ensure that the user is only accessing or modifying their own data.
   * It compares the phoneNumber in the JWT payload with the one in the request body.
   */
  @Injectable()
  export class OwnerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
  
      // Extract phoneNumber from JWT payload and request body
      const phoneNumberFromToken = request.user?.phoneNumber;
      const phoneNumberFromBody = request.body?.phoneNumber;
  
      // If phoneNumber is missing in the body, throw an error
      if (!phoneNumberFromBody) {
        throw new ForbiddenException(
          'phoneNumber is required in the request body',
        );
      }
  
      // Deny access if phone numbers do not match
      if (phoneNumberFromToken !== phoneNumberFromBody) {
        throw new ForbiddenException(
          'You are not authorized to access this resource',
        );
      }
  
      return true;
    }
  }
  