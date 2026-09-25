import { Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [products, publishedProducts, categories, media, admins] =
      await this.prisma.$transaction([
        this.prisma.product.count({ where: { deletedAt: null } }),
        this.prisma.product.count({
          where: { deletedAt: null, status: ContentStatus.PUBLISHED },
        }),
        this.prisma.productCategory.count(),
        this.prisma.mediaAsset.count(),
        this.prisma.admin.count({ where: { deletedAt: null } }),
      ]);
    return { products, publishedProducts, categories, media, admins };
  }
}
