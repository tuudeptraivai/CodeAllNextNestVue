import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admin role has all permissions
    if (user.role?.name === 'admin') {
      return true;
    }

    const method = request.method;
    const path = request.route?.path; // NestJS path template like /rbac/roles/:id

    // If path is not found (e.g. middleware or other cases), default to true or handle accordingly
    if (!path) {
      return true;
    }

    const permissions = user.role?.permissions || [];
    
    const hasPermission = permissions.some(p => {
      // Check if path matches (ignoring trailing slashes and ensuring case consistency)
      const pPath = p.apiPath.replace(/\/+$/, '') || '/';
      const rPath = path.replace(/\/+$/, '') || '/';
      
      return p.method.toUpperCase() === method.toUpperCase() && pPath === rPath;
    });

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    return true;
  }
}
