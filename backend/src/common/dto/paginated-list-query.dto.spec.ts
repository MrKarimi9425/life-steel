import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginatedListQueryDto } from './paginated-list-query.dto';

describe('PaginatedListQueryDto', () => {
  it('applies pagination defaults', async () => {
    const request = plainToInstance(PaginatedListQueryDto, {});

    await expect(validate(request)).resolves.toEqual([]);
    expect(request).toMatchObject({ pageIndex: 1, pageSize: 20 });
  });

  it('transforms valid numeric query values', async () => {
    const request = plainToInstance(PaginatedListQueryDto, {
      pageIndex: '2',
      pageSize: '50',
      query: 'wedding',
    });

    await expect(validate(request)).resolves.toEqual([]);
    expect(request).toMatchObject({
      pageIndex: 2,
      pageSize: 50,
      query: 'wedding',
    });
  });

  it('rejects page sizes above the server limit', async () => {
    const request = plainToInstance(PaginatedListQueryDto, {
      pageSize: 101,
    });

    await expect(validate(request)).resolves.not.toEqual([]);
  });
});
