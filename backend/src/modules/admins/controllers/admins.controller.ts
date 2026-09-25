import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { AUTH_BEARER_SECURITY_NAME } from '../../auth/constants/auth-token.constants';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { OwnerGuard } from '../../auth/guards/owner.guard';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminStatusDto } from '../dto/update-admin-status.dto';
import { AdminsService } from '../services/admins.service';

@ApiTags('Admin management')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard, OwnerGuard)
@Controller({ path: 'admins', version: '1' })
export class AdminsController {
  constructor(private readonly admins: AdminsService) {}

  @Get()
  async list() {
    return createSuccessResponse(
      'فهرست ادمین ها دریافت شد.',
      await this.admins.list(),
    );
  }

  @Post()
  async create(@Body() input: CreateAdminDto) {
    return createSuccessResponse(
      'ادمین ایجاد شد.',
      await this.admins.create(input),
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() input: UpdateAdminStatusDto,
  ) {
    await this.admins.updateStatus(id, input.status);
    return createSuccessResponse('وضعیت ادمین تغییر کرد.', null);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return createSuccessResponse(
      'رمز موقت جدید ایجاد شد.',
      await this.admins.resetPassword(id),
    );
  }
}
