import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import type { UpdateProductPricingDto } from '../dto/product-pricing.dto';

@Injectable()
export class ProductPricingRepository {
  constructor(private readonly prisma: PrismaService) {}
  find(id: string) {
    return this.findMany([id]).then((rows) => rows[0] ?? null);
  }
  findMany(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        showPrice: true,
        basePrice: true,
        colorPrices: true,
        colorImages: true,
        media: {
          select: {
            media: { include: { translations: true, variants: true } },
          },
          orderBy: { displayOrder: 'asc' },
        },
        attributeValues: {
          where: { attribute: { type: 'COLOR', isActive: true } },
          select: {
            selectedOptions: {
              where: { option: { isActive: true } },
              select: {
                option: {
                  select: {
                    id: true,
                    colorHex: true,
                    translations: { select: { languageId: true, label: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  save(id: string, input: UpdateProductPricingDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        showPrice: input.showPrice,
        basePrice: input.basePrice ? BigInt(input.basePrice) : null,
        colorPrices: {
          deleteMany: {},
          create: input.colors
            .filter((color) => color.amount)
            .map((color) => ({
              optionId: color.optionId,
              amount: BigInt(color.amount!),
            })),
        },
        ...(input.colors.some((color) => color.mediaIds !== undefined)
          ? {
              colorImages: {
                deleteMany: {},
                create: input.colors.flatMap((color) =>
                  (color.mediaIds ?? []).map((mediaId) => ({
                    optionId: color.optionId,
                    mediaId,
                    isPrimary: mediaId === color.primaryMediaId,
                  })),
                ),
              },
            }
          : {}),
      },
      select: { id: true },
    });
  }
}
