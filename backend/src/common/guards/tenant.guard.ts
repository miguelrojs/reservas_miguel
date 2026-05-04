import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Token inválido o falta tenant_id');
    }

    // In a more complex scenario, we could check if the tenant exists in DB
    // For now, we trust the JWT payload
    return true;
  }
}
