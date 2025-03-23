import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles"
export const Roles = (...roles: [Role, ...Role[]]) => //the type ensures that it is of the role enum and not empty
    SetMetadata(ROLES_KEY, roles)