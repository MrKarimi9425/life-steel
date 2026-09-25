import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.admin.isOwner) {
      throw new ForbiddenException('این عملیات فقط برای مدیر اصلی مجاز است.');
    }

    return true;
  }
}
