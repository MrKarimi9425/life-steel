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
