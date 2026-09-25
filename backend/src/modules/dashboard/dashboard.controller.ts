import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../common/http/success-response';
import { AUTH_BEARER_SECURITY_NAME } from '../auth/constants/auth-token.constants';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin management')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  async summary() {
    return createSuccessResponse(
      'خلاصه داشبورد دریافت شد.',
      await this.dashboard.summary(),
    );
  }
}
