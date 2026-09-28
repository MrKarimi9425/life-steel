import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { MediaService } from './media.service';
import { ImageProcessorService } from './image-processor.service';

describe('Product media ownership', () => {
  function setup() {
    const asset = {
      path: 'image/optimized.webp',
      productMedia: [] as Array<{ productId: string }>,
      productCovers: [] as Array<{ id: string }>,
      _count: { articleMedia: 0, sitePageMedia: 0, categoryImages: 0 },
    };
    const findMany = jest.fn().mockResolvedValue([asset]);
    const service = new MediaService(
      {
        getOrThrow: (key: string) =>
          key === 'MEDIA_STORAGE_PATH' ? 'storage/media' : 10,
      } as unknown as ConfigService,
      { mediaAsset: { findMany } } as unknown as PrismaService,
      {} as ImageProcessorService,
    );
    return { service, asset, findMany };
  }
  it('accepts unattached images and deduplicates gallery and cover IDs', async () => {
    const { service } = setup();
    await expect(
      service.assertProductMedia(['image', 'image']),
    ).resolves.toBeUndefined();
  });
  it('accepts images already belonging to the same product', async () => {
    const { service, asset } = setup();
    asset.productMedia = [{ productId: 'product' }];
    asset.productCovers = [{ id: 'product' }];
    await expect(
      service.assertProductMedia(['image'], 'product'),
    ).resolves.toBeUndefined();
  });
  it.each(['articleMedia', 'sitePageMedia', 'categoryImages'] as const)(
    'rejects images used by %s',
    async (relation) => {
      const { service, asset } = setup();
      asset._count[relation] = 1;
      await expect(
        service.assertProductMedia(['image'], 'product'),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
  it('rejects another product gallery or cover', async () => {
    const { service, asset } = setup();
    asset.productMedia = [{ productId: 'foreign' }];
    await expect(
      service.assertProductMedia(['image'], 'product'),
    ).rejects.toBeInstanceOf(BadRequestException);
    asset.productMedia = [];
    asset.productCovers = [{ id: 'foreign' }];
    await expect(
      service.assertProductMedia(['image'], 'product'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('rejects missing or unready IDs and skips an empty list', async () => {
    const { service, findMany } = setup();
    await service.assertProductMedia([]);
    expect(findMany).not.toHaveBeenCalled();
    findMany.mockResolvedValue([]);
    await expect(
      service.assertProductMedia(['missing']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
