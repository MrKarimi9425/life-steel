import { BadRequestException } from '@nestjs/common';
import {
  ContentStatus,
  TranslationStatus,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { MediaService } from '../../media/services/media.service';
import { CreateProductDto } from '../dto/catalog.dto';
import { CatalogService } from './catalog.service';
import { ProductPricingService } from './product-pricing.service';

const baseProduct = (): CreateProductDto => ({
  status: ContentStatus.DRAFT,
  isFeatured: false,
  categoryIds: ['category-1'],
  primaryCategoryId: 'category-1',
  mediaIds: [],
  relatedProductIds: [],
  translations: [{ languageId: 'fa', status: TranslationStatus.DRAFT }],
  attributeValues: [],
});

describe('CatalogService product rules', () => {
  it('filters public products by visible base or color price', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      language: {
        findFirst: jest.fn().mockResolvedValue({ id: 'fa' }),
      },
      product: { findMany, count },
      $transaction: jest.fn((queries: Array<Promise<unknown>>) =>
        Promise.all(queries),
      ),
    };
    const service = new CatalogService(
      prisma as unknown as PrismaService,
      {} as MediaService,
      {
        publicPricings: jest.fn().mockResolvedValue(new Map()),
      } as unknown as ProductPricingService,
    );

    await service.listPublicProducts({
      language: 'fa',
      minPrice: '1200000',
      maxPrice: '3500000',
      page: 1,
      pageSize: 12,
    });

    const firstCall = findMany.mock.calls[0] as unknown as
      [{ where: unknown }] | undefined;
    const where = firstCall?.[0].where;
    expect(where).toMatchObject({
      showPrice: true,
      OR: [
        { basePrice: { gte: 1200000n, lte: 3500000n } },
        {
          colorPrices: {
            some: { amount: { gte: 1200000n, lte: 3500000n } },
          },
        },
      ],
    });
    expect(count).toHaveBeenCalledWith({ where });
  });

  it.each([
    [
      'newest',
      [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    ],
    ['oldest', [{ publishedAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }]],
  ] as const)(
    'uses stable public product sorting for %s',
    async (sort, orderBy) => {
      const findMany = jest.fn().mockResolvedValue([]);
      const prisma = {
        language: {
          findFirst: jest.fn().mockResolvedValue({ id: 'fa' }),
        },
        product: {
          findMany,
          count: jest.fn().mockResolvedValue(0),
        },
        $transaction: jest.fn((queries: Array<Promise<unknown>>) =>
          Promise.all(queries),
        ),
      };
      const service = new CatalogService(
        prisma as unknown as PrismaService,
        {} as MediaService,
        {
          publicPricings: jest.fn().mockResolvedValue(new Map()),
        } as unknown as ProductPricingService,
      );

      await service.listPublicProducts({
        language: 'fa',
        sort,
        page: 1,
        pageSize: 12,
      });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy }),
      );
    },
  );

  it('rejects a public price range with a minimum above the maximum', async () => {
    const service = new CatalogService(
      {} as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );

    await expect(
      service.listPublicProducts({
        language: 'fa',
        minPrice: '500',
        maxPrice: '100',
        page: 1,
        pageSize: 12,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('combines different attributes with AND and options of one attribute with OR', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      language: {
        findFirst: jest.fn().mockResolvedValue({ id: 'fa' }),
      },
      product: {
        findMany,
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn((queries: Array<Promise<unknown>>) =>
        Promise.all(queries),
      ),
    };
    const service = new CatalogService(
      prisma as unknown as PrismaService,
      {} as MediaService,
      {
        publicPricings: jest.fn().mockResolvedValue(new Map()),
      } as unknown as ProductPricingService,
    );

    await service.listPublicProducts({
      language: 'fa',
      attributeFilters: [
        'color:option:black',
        'color:option:white',
        'width:min:45',
        'width:max:60',
        'mounted:boolean:true',
      ],
      page: 1,
      pageSize: 12,
    });

    const firstCall = findMany.mock.calls[0] as unknown as
      [{ where: { AND: unknown } }] | undefined;
    expect(firstCall?.[0].where.AND).toEqual([
      {
        attributeValues: {
          some: {
            attributeId: 'color',
            selectedOptions: {
              some: { optionId: { in: ['black', 'white'] } },
            },
          },
        },
      },
      {
        attributeValues: {
          some: {
            attributeId: 'width',
            numberValue: { gte: 45, lte: 60 },
          },
        },
      },
      {
        attributeValues: {
          some: {
            attributeId: 'mounted',
            booleanValue: true,
          },
        },
      },
    ]);
  });

  it('rejects malformed multi-attribute filters', async () => {
    const service = new CatalogService(
      {} as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );

    await expect(
      service.listPublicProducts({
        language: 'fa',
        attributeFilters: ['width:min:90', 'width:max:40'],
        page: 1,
        pageSize: 12,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([false, 'error'])(
    'reports incomplete cleanup after deleting a product: %s',
    async (outcome) => {
      const remove =
        outcome === 'error'
          ? jest.fn().mockRejectedValue(new Error('Storage unavailable'))
          : jest.fn().mockResolvedValue(false);
      const transaction = {
        product: { delete: jest.fn().mockResolvedValue({}) },
      };
      const service = new CatalogService(
        {
          $transaction: (callback: (client: typeof transaction) => unknown) =>
            callback(transaction),
        } as unknown as PrismaService,
        { remove } as unknown as MediaService,
        {} as ProductPricingService,
      );
      jest.spyOn(service, 'getProduct').mockResolvedValue({
        coverMediaId: 'image',
        media: [],
        attributeValues: [],
      } as never);
      expect(await service.deleteProduct('product')).toEqual({
        cleanupComplete: false,
      });
      expect(transaction.product.delete).toHaveBeenCalled();
    },
  );
  it('reorders visible products without moving hidden page records', async () => {
    const products = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
    const update = jest.fn(
      (input: { where: { id: string }; data: { displayOrder: number } }) =>
        Promise.resolve(input),
    );
    const prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue(products),
        update,
      },
      $transaction: jest.fn((updates: Array<Promise<unknown>>) =>
        Promise.all(updates),
      ),
    };
    const service = new CatalogService(
      prisma as unknown as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );

    await service.reorderProducts(['d', 'b']);

    expect(update.mock.calls.map(([call]) => call)).toEqual([
      { where: { id: 'a' }, data: { displayOrder: 0 } },
      { where: { id: 'd' }, data: { displayOrder: 1 } },
      { where: { id: 'c' }, data: { displayOrder: 2 } },
      { where: { id: 'b' }, data: { displayOrder: 3 } },
    ]);
  });

  it('requires a primary category from selected categories', async () => {
    const service = new CatalogService(
      {} as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );
    const input = baseProduct();
    input.primaryCategoryId = 'another-category';

    await expect(service.createProduct(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('requires a published Persian translation before publication', async () => {
    const prisma = {
      language: {
        findMany: jest.fn().mockResolvedValue([{ id: 'fa', name: 'فارسی' }]),
      },
    };
    const service = new CatalogService(
      prisma as unknown as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );
    const input = baseProduct();
    input.status = ContentStatus.PUBLISHED;

    await expect(service.createProduct(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.language.findMany).toHaveBeenCalled();
  });

  it('allows an incomplete translation in a draft', async () => {
    const transaction = {
      product: {
        aggregate: jest.fn().mockResolvedValue({
          _max: { displayOrder: null },
        }),
        create: jest.fn((input: unknown) => {
          expect(input).toBeDefined();
          return Promise.resolve({ id: 'product-1' });
        }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    };
    const service = new CatalogService(
      prisma as unknown as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );

    await service.createProduct(baseProduct());

    const call = transaction.product.create.mock.calls[0]?.[0] as {
      data: { translations: { create: unknown } };
    };
    expect(call.data.translations.create).toEqual([
      {
        languageId: 'fa',
        status: TranslationStatus.DRAFT,
        title: null,
        slug: null,
      },
    ]);
  });

  it('archives a product without marking it deleted', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'product-1' });
    const service = new CatalogService(
      { product: { update } } as unknown as PrismaService,
      {} as MediaService,
      {} as ProductPricingService,
    );
    jest
      .spyOn(service, 'getProduct')
      .mockResolvedValue({ id: 'product-1' } as never);

    await service.archiveProduct('product-1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { status: ContentStatus.ARCHIVED },
    });
  });

  it('permanently deletes a product and cleans only unused media', async () => {
    const remove = jest.fn().mockResolvedValue(true);
    const transaction = {
      product: { delete: jest.fn().mockResolvedValue({ id: 'product-1' }) },
      productAttributeValue: { count: jest.fn().mockResolvedValue(0) },
      attributeDefinition: { delete: jest.fn().mockResolvedValue({}) },
    };
    const service = new CatalogService(
      {
        $transaction: jest.fn(
          (callback: (client: typeof transaction) => unknown) =>
            callback(transaction),
        ),
      } as unknown as PrismaService,
      { remove } as unknown as MediaService,
      {} as ProductPricingService,
    );
    jest.spyOn(service, 'getProduct').mockResolvedValue({
      id: 'product-1',
      coverMediaId: 'image-1',
      media: [{ mediaId: 'image-1' }, { mediaId: 'image-2' }],
      attributeValues: [{ isCustom: true, attributeId: 'custom-1' }],
    } as never);

    await service.deleteProduct('product-1');

    expect(transaction.product.delete).toHaveBeenCalledWith({
      where: { id: 'product-1' },
    });
    expect(transaction.attributeDefinition.delete).toHaveBeenCalledWith({
      where: { id: 'custom-1' },
    });
    expect(remove.mock.calls).toEqual([
      ['image-1', { skipIfReferenced: true }],
      ['image-2', { skipIfReferenced: true }],
    ]);
  });
});
