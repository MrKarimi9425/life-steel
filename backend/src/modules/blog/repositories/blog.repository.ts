import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import type { Prisma } from '../../../generated/prisma/client';

export const blogArticleSelect = {
  id: true,
  status: true,
  coverMediaId: true,
  displayOrder: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: {
      languageId: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
    },
  },
  categories: { select: { categoryId: true, isPrimary: true } },
  tags: { select: { tagId: true } },
  media: {
    orderBy: { displayOrder: 'asc' },
    select: {
      mediaId: true,
      displayOrder: true,
      media: {
        select: {
          id: true,
          kind: true,
          path: true,
          width: true,
          height: true,
          variants: true,
          translations: true,
        },
      },
    },
  },
} satisfies Prisma.BlogArticleSelect;

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  languages() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
    });
  }

  publicArticle(languageId: string, slug: string) {
    return this.prisma.blogArticle.findFirst({
      where: {
        status: 'PUBLISHED',
        translations: { some: { languageId, slug, status: 'PUBLISHED' } },
      },
      select: blogArticleSelect,
    });
  }

  publicRelated(languageId: string, articleId: string, categoryId: string) {
    return this.prisma.blogArticle.findMany({
      where: {
        id: { not: articleId },
        status: 'PUBLISHED',
        categories: { some: { categoryId, category: { isActive: true } } },
        translations: { some: { languageId, status: 'PUBLISHED' } },
      },
      take: 6,
      orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
      select: {
        ...blogArticleSelect,
        media: false,
        translations: {
          where: { languageId, status: 'PUBLISHED' },
          select: {
            languageId: true,
            title: true,
            slug: true,
            summary: true,
            status: true,
          },
        },
      },
    });
  }

  covers(ids: string[]) {
    return this.prisma.mediaAsset.findMany({
      where: { id: { in: ids }, processingStatus: 'READY', kind: 'IMAGE' },
      select: {
        id: true,
        path: true,
        width: true,
        height: true,
        variants: true,
        translations: true,
      },
    });
  }
  article(id: string) {
    return this.prisma.blogArticle.findUnique({
      where: { id },
      select: blogArticleSelect,
    });
  }
  async articles(
    where: Prisma.BlogArticleWhereInput,
    page: number,
    pageSize: number,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogArticle.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        select: {
          ...blogArticleSelect,
          media: false,
          translations: {
            select: {
              languageId: true,
              title: true,
              slug: true,
              summary: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.blogArticle.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }
  async createArticle(data: Prisma.BlogArticleCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const latest = await tx.blogArticle.aggregate({
        _max: { displayOrder: true },
      });
      return tx.blogArticle.create({
        data: { ...data, displayOrder: (latest._max.displayOrder ?? -1) + 1 },
        select: blogArticleSelect,
      });
    });
  }
  updateArticle(id: string, data: Prisma.BlogArticleUpdateInput) {
    return this.prisma.blogArticle.update({
      where: { id },
      data,
      select: blogArticleSelect,
    });
  }
  deleteArticle(id: string) {
    return this.prisma.blogArticle.delete({
      where: { id },
      select: { id: true },
    });
  }
  categories() {
    return this.prisma.blogCategory.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        isActive: true,
        displayOrder: true,
        translations: {
          select: {
            languageId: true,
            title: true,
            slug: true,
            description: true,
            seoTitle: true,
            seoDescription: true,
          },
        },
        _count: { select: { articles: true } },
      },
    });
  }
  tags() {
    return this.prisma.blogTag.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        isActive: true,
        displayOrder: true,
        translations: { select: { languageId: true, title: true, slug: true } },
        _count: { select: { articles: true } },
      },
    });
  }
  category(id: string) {
    return this.prisma.blogCategory.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        _count: { select: { articles: true } },
      },
    });
  }
  tag(id: string) {
    return this.prisma.blogTag.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        _count: { select: { articles: true } },
      },
    });
  }
  async createCategory(data: Prisma.BlogCategoryCreateInput) {
    const latest = await this.prisma.blogCategory.aggregate({
      _max: { displayOrder: true },
    });
    return this.prisma.blogCategory.create({
      data: { ...data, displayOrder: (latest._max.displayOrder ?? -1) + 1 },
      select: { id: true },
    });
  }
  async createTag(data: Prisma.BlogTagCreateInput) {
    const latest = await this.prisma.blogTag.aggregate({
      _max: { displayOrder: true },
    });
    return this.prisma.blogTag.create({
      data: { ...data, displayOrder: (latest._max.displayOrder ?? -1) + 1 },
      select: { id: true },
    });
  }
  updateCategory(id: string, data: Prisma.BlogCategoryUpdateInput) {
    return this.prisma.blogCategory.update({
      where: { id },
      data,
      select: { id: true },
    });
  }
  updateTag(id: string, data: Prisma.BlogTagUpdateInput) {
    return this.prisma.blogTag.update({
      where: { id },
      data,
      select: { id: true },
    });
  }
  deleteCategory(id: string) {
    return this.prisma.blogCategory.delete({
      where: { id },
      select: { id: true },
    });
  }
  deleteTag(id: string) {
    return this.prisma.blogTag.delete({ where: { id }, select: { id: true } });
  }
  countCategories(ids: string[]) {
    return this.prisma.blogCategory.count({ where: { id: { in: ids } } });
  }
  countTags(ids: string[]) {
    return this.prisma.blogTag.count({ where: { id: { in: ids } } });
  }
  media(ids: string[]) {
    return this.prisma.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        path: true,
        kind: true,
        processingStatus: true,
        articleMedia: { select: { articleId: true } },
        bannerDesktop: { select: { bannerId: true } },
        bannerTablet: { select: { bannerId: true } },
        bannerMobile: { select: { bannerId: true } },
        _count: {
          select: {
            productMedia: true,
            productCovers: true,
            productColorImages: true,
            categoryImages: true,
            sitePageMedia: true,
          },
        },
      },
    });
  }
  async reorder(kind: 'articles' | 'categories' | 'tags', ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const rows =
        kind === 'articles'
          ? await tx.blogArticle.findMany({
              orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
              select: { id: true },
            })
          : kind === 'categories'
            ? await tx.blogCategory.findMany({
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
                select: { id: true },
              })
            : await tx.blogTag.findMany({
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
                select: { id: true },
              });
      const selected = new Set(ids);
      if (rows.filter((row) => selected.has(row.id)).length !== ids.length)
        return false;
      let cursor = 0;
      for (const [index, row] of rows.entries()) {
        const id = selected.has(row.id) ? (ids[cursor++] ?? row.id) : row.id;
        const data = { displayOrder: index };
        if (kind === 'articles')
          await tx.blogArticle.update({ where: { id }, data });
        else if (kind === 'categories')
          await tx.blogCategory.update({ where: { id }, data });
        else await tx.blogTag.update({ where: { id }, data });
      }
      return true;
    });
  }
}
