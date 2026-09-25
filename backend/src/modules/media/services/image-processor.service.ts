import { BadRequestException, Injectable } from '@nestjs/common';
import { createRequire } from 'node:module';
import type { Sharp } from 'sharp';

type SharpFactory = (
  input: Buffer,
  options?: { limitInputPixels?: number },
) => Sharp;
const sharp = createRequire(__filename)('sharp') as SharpFactory;

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
};

@Injectable()
export class ImageProcessorService {
  async assertSquareMax1200(buffer: Buffer): Promise<void> {
    try {
      const metadata = await sharp(buffer, {
        limitInputPixels: 60_000_000,
      }).metadata();
      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width !== metadata.height ||
        metadata.width > 1200
      ) {
        throw new BadRequestException(
          'عکس باید مربع و حداکثر ۱۲۰۰ در ۱۲۰۰ پیکسل باشد.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('محتوای تصویر معتبر نیست.');
    }
  }

  async process(
    buffer: Buffer,
    maxDimension: number,
    quality: number,
  ): Promise<ProcessedImage> {
    try {
      const result = await sharp(buffer, { limitInputPixels: 60_000_000 })
        .rotate()
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });
      return {
        buffer: result.data,
        width: result.info.width,
        height: result.info.height,
      };
    } catch {
      throw new BadRequestException('محتوای تصویر معتبر نیست.');
    }
  }
}
