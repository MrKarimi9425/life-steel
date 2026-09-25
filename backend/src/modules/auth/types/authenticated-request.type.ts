import type { Request } from 'express';
import type { AuthenticatedAdmin } from './authenticated-admin.type';

export type AuthenticatedRequest = Request & {
  admin: AuthenticatedAdmin;
};
