import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SuccessResponse } from '../common/http/success-response';
import { createSuccessResponse } from '../common/http/success-response';
import { ApiSuccessResponse } from '../common/swagger/api-success-response.decorator';

class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';
}

@ApiTags('System')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API health' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    description: 'API health returned',
    dataType: HealthResponseDto,
  })
  check(): SuccessResponse<HealthResponseDto> {
    return createSuccessResponse('وضعیت سرویس دریافت شد.', { status: 'ok' });
  }
}
