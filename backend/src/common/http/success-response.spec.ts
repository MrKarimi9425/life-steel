import { describe, expect, it } from '@jest/globals';
import { createSuccessResponse } from './success-response';

describe('createSuccessResponse', () => {
  it('preserves a typed payload inside data', () => {
    const payload = { id: 'resource-id', status: 'DRAFT' as const };

    expect(createSuccessResponse('منبع ایجاد شد.', payload)).toEqual({
      message: 'منبع ایجاد شد.',
      data: payload,
    });
  });

  it('uses an explicit null data field when no payload exists', () => {
    expect(createSuccessResponse('منبع حذف شد.', null)).toEqual({
      message: 'منبع حذف شد.',
      data: null,
    });
  });
});
