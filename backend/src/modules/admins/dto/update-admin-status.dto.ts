import { IsEnum } from 'class-validator';
import { AdminStatus } from '../../../generated/prisma/client';

export class UpdateAdminStatusDto {
  @IsEnum(AdminStatus)
  status!: AdminStatus;
}
