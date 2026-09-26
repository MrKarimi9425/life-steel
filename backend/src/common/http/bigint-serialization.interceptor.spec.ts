import type { ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { BigIntSerializationInterceptor } from './bigint-serialization.interceptor';

describe('BigIntSerializationInterceptor', () => {
  it('preserves dates while converting nested bigint values', async () => {
    const publishedAt = new Date('2026-09-26T12:00:00.000Z');
    const result = await firstValueFrom(
      new BigIntSerializationInterceptor().intercept({} as ExecutionContext, {
        handle: () =>
          of({
            data: [{ publishedAt, size: BigInt(1200), title: 'Demo' }],
            empty: null,
          }),
      }),
    );
    expect(result).toEqual({
      data: [
        { publishedAt: publishedAt.toISOString(), size: '1200', title: 'Demo' },
      ],
      empty: null,
    });
  });
});
