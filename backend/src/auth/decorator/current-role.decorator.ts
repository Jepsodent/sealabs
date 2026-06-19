import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const CurrentRole = (...roles:Role[]) => SetMetadata('allowed_roles',roles)
