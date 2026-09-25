import { BadRequestException } from '@nestjs/common';
import { createRequire } from 'node:module';
import type { Sharp } from 'sharp';
import { ImageProcessorService } from './image-processor.service';

const sharp = createRequire(__filename)('sharp') as (input: {
  create: { width: number; height: number; channels: 4; background: string };
}) => Sharp;

const image = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 4, background: '#ff8800' } })
    .png()
    .toBuffer();

describe('ImageProcessorService upload dimensions', () => {
  const processor = new ImageProcessorService();

  it('accepts a small square image without requiring upscaling', async () => {
    await expect(
      processor.assertSquareMax1200(await image(100, 100)),
    ).resolves.toBeUndefined();
  });

  it('accepts a square image at the maximum size', async () => {
    await expect(
      processor.assertSquareMax1200(await image(1200, 1200)),
    ).resolves.toBeUndefined();
  });

  it('rejects images larger than the maximum size', async () => {
    await expect(
      processor.assertSquareMax1200(await image(1201, 1201)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a non-square image', async () => {
    await expect(
      processor.assertSquareMax1200(await image(100, 101)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
