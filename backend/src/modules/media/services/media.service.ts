import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  MediaKind,
  MediaProcessingStatus,
  MediaSource,
  MediaVariantKind,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ImageProcessorService } from './image-processor.service';
import type { MediaTranslationDto } from '../dto/update-media-translations.dto';

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const videoMimeTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

@Injectable()
export class MediaService {
  private readonly storageRoot: string;
  private readonly maxImageBytes: number;
  private readonly maxVideoBytes: number;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly images: ImageProcessorService,
  ) {
    this.storageRoot = resolve(
      process.cwd(),
      config.getOrThrow<string>('MEDIA_STORAGE_PATH'),
    );
    this.maxImageBytes =
      config.getOrThrow<number>('MAX_IMAGE_SIZE_MB') * 1024 * 1024;
    this.maxVideoBytes =
      config.getOrThrow<number>('MAX_VIDEO_SIZE_MB') * 1024 * 1024;
  }

  list() {
    return this.prisma.mediaAsset.findMany({
      where: { articleMedia: { none: {} } },
      include: { variants: true, translations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(file: Express.Multer.File, requireSquareMax1200 = false) {
    if (imageMimeTypes.has(file.mimetype))
      return this.uploadImage(file, requireSquareMax1200);
    if (videoMimeTypes.has(file.mimetype)) return this.uploadVideo(file);
    throw new BadRequestException('فرمت فایل پشتیبانی نمیشود.');
  }

  async assertNotBlogMedia(ids: string[]) {
    if (!ids.length) return;
    const references = await this.prisma.blogArticleMedia.count({
      where: { mediaId: { in: ids } },
    });
    if (references > 0) {
      throw new BadRequestException(
        'تصاویر گالری مقاله در بخش دیگری قابل استفاده نیستند.',
      );
    }
  }

  async assertProductMedia(ids: string[], productId?: string) {
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length) return;
    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        id: { in: uniqueIds },
        processingStatus: MediaProcessingStatus.READY,
      },
      include: {
        productMedia: { select: { productId: true } },
        productCovers: { select: { id: true } },
        _count: {
          select: {
            articleMedia: true,
            sitePageMedia: true,
            categoryImages: true,
          },
        },
      },
    });
    if (
      assets.length !== uniqueIds.length ||
      assets.some(
        (asset) =>
          !asset.path ||
          asset._count.articleMedia > 0 ||
          asset._count.sitePageMedia > 0 ||
          asset._count.categoryImages > 0 ||
          asset.productMedia.some((item) => item.productId !== productId) ||
          asset.productCovers.some((item) => item.id !== productId),
      )
    )
      throw new BadRequestException(
        'فایل آماده نیست یا متعلق به گالری دیگری است.',
      );
  }

  createExternalVideo(url: string, title: string) {
    return this.prisma.mediaAsset.create({
      data: {
        kind: MediaKind.VIDEO,
        source: MediaSource.EXTERNAL,
        externalUrl: url,
        originalFileName: title,
        processingStatus: MediaProcessingStatus.READY,
      },
    });
  }

  async updateTranslations(id: string, translations: MediaTranslationDto[]) {
    const media = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('رسانه پیدا نشد.');
    const languageIds = translations.map((item) => item.languageId);
    const languages = await this.prisma.language.count({
      where: { id: { in: languageIds }, isActive: true },
    });
    if (languages !== languageIds.length) {
      throw new BadRequestException('زبان انتخاب شده معتبر نیست.');
    }
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {},
          create: translations.map((item) => ({
            languageId: item.languageId,
            title: item.title?.trim() || null,
            altText: item.altText?.trim() || null,
            caption: item.caption?.trim() || null,
          })),
        },
      },
      include: { translations: true, variants: true },
    });
  }

  async remove(
    id: string,
    options: { skipIfReferenced?: boolean } = {},
  ): Promise<boolean> {
    const media = await this.prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productMedia: true,
            productCovers: true,
            categoryImages: true,
            articleMedia: true,
            sitePageMedia: true,
          },
        },
      },
    });
    if (!media) {
      if (options.skipIfReferenced) return false;
      throw new NotFoundException('رسانه پیدا نشد.');
    }
    if (
      media._count.productMedia > 0 ||
      media._count.productCovers > 0 ||
      media._count.categoryImages > 0 ||
      media._count.articleMedia > 0 ||
      media._count.sitePageMedia > 0
    ) {
      if (options.skipIfReferenced) return false;
      throw new BadRequestException(
        'این رسانه در حال استفاده است و قابل حذف نیست.',
      );
    }
    await this.prisma.mediaAsset.delete({ where: { id } });
    if (media.source === MediaSource.UPLOAD) {
      await rm(resolve(this.storageRoot, id), { recursive: true, force: true });
    }
    return true;
  }

  private async uploadImage(
    file: Express.Multer.File,
    requireSquareMax1200: boolean,
  ) {
    if (file.size > this.maxImageBytes) {
      throw new BadRequestException('حجم تصویر بیشتر از حد مجاز است.');
    }
    if (requireSquareMax1200)
      await this.images.assertSquareMax1200(file.buffer);
    const media = await this.prisma.mediaAsset.create({
      data: {
        kind: MediaKind.IMAGE,
        source: MediaSource.UPLOAD,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
    const directory = resolve(this.storageRoot, media.id);
    await mkdir(directory, { recursive: true });

    try {
      const definitions = [
        [MediaVariantKind.THUMBNAIL, 320, 78],
        [MediaVariantKind.CARD, 900, 82],
        [MediaVariantKind.LARGE, 1800, 85],
        [MediaVariantKind.OPTIMIZED, 3000, 87],
      ] as const;
      const variants = [];
      for (const [kind, size, quality] of definitions) {
        const output = await this.images.process(file.buffer, size, quality);
        const fileName = `${kind.toLowerCase()}.webp`;
        await writeFile(resolve(directory, fileName), output.buffer);
        variants.push({
          mediaId: media.id,
          kind,
          path: `${media.id}/${fileName}`,
          mimeType: 'image/webp',
          sizeBytes: output.buffer.length,
          width: output.width,
          height: output.height,
        });
      }
      const optimized = variants.find(
        (item) => item.kind === MediaVariantKind.OPTIMIZED,
      )!;
      await this.prisma.$transaction([
        this.prisma.mediaVariant.createMany({ data: variants }),
        this.prisma.mediaAsset.update({
          where: { id: media.id },
          data: {
            path: optimized.path,
            mimeType: optimized.mimeType,
            sizeBytes: optimized.sizeBytes,
            width: optimized.width,
            height: optimized.height,
            processingStatus: MediaProcessingStatus.READY,
          },
        }),
      ]);
      return this.prisma.mediaAsset.findUnique({
        where: { id: media.id },
        include: { variants: true, translations: true },
      });
    } catch (error) {
      await this.prisma.mediaAsset.update({
        where: { id: media.id },
        data: {
          processingStatus: MediaProcessingStatus.FAILED,
          processingError:
            error instanceof Error ? error.message : 'Image processing failed',
        },
      });
      await rm(directory, { recursive: true, force: true });
      throw error;
    }
  }

  private async uploadVideo(file: Express.Multer.File) {
    if (file.size > this.maxVideoBytes) {
      throw new BadRequestException('حجم ویدیو بیشتر از حد مجاز است.');
    }
    const media = await this.prisma.mediaAsset.create({
      data: {
        kind: MediaKind.VIDEO,
        source: MediaSource.UPLOAD,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
    const extension =
      file.mimetype === 'video/webm'
        ? 'webm'
        : file.mimetype === 'video/quicktime'
          ? 'mov'
          : 'mp4';
    const directory = resolve(this.storageRoot, media.id);
    await mkdir(directory, { recursive: true });
    const path = `${media.id}/video.${extension}`;
    await writeFile(resolve(this.storageRoot, path), file.buffer);
    return this.prisma.mediaAsset.update({
      where: { id: media.id },
      data: { path, processingStatus: MediaProcessingStatus.READY },
    });
  }
}
