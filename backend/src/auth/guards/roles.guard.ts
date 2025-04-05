import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "@prisma/client";

//This guards prevents a request from going if it doesnt have a valid jwt.

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //extract the roll (or rolles) for the current call of the guard from the metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
    ]);

    //extract the user from the request object
    //(JWT guard needs to run before this guard is ran so that the user object is assigned to the request)
    const user = context.switchToHttp().getRequest().user;

    //check if user has one of the required roles
    const hasRequiredRoles = requiredRoles.some((role) => user.role === role);

    return hasRequiredRoles;
  }
}
