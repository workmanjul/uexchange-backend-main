import {
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import AtGuard from "./atguard";
import { PrismaService } from "src/prisma/prisma.service";

const PermissionGuard = (permission: any): Type<CanActivate> => {
  class PermissionGuardMixin extends AtGuard implements CanActivate {
    constructor() {
      super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      await super.canActivate(context);
      const prisma = new PrismaService();
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const message = `you don't have ${permission} permission`;
      const hasPermission = user?.permissions.includes(permission);
      if (!hasPermission) {
        throw new UnauthorizedException(message);
      }
      return true;

      //   // Perform the necessary permission check here
      //   // For example:
      //   const hasPermission = user?.permissions.includes(permission);

      //   return hasPermission;
    }
  }

  return mixin(PermissionGuardMixin);
};

export default PermissionGuard;
