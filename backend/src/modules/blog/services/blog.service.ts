import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  MediaKind,
  MediaProcessingStatus,
  TranslationStatus,
  type Prisma,
} from '../../../generated/prisma/client';
import { MediaService } from '../../media/services/media.service';
import { BlogRepository } from '../repositories/blog.repository';
import type {
  BlogArticleTranslationDto,
  BlogListQueryDto,
  BlogTaxonomyTranslationDto,
  CreateBlogArticleDto,
  CreateBlogTaxonomyDto,
  UpdateBlogArticleDto,
  UpdateBlogGalleryDto,
  UpdateBlogTaxonomyDto,
  PublicBlogListQueryDto,
} from '../dto/blog.dto';
import { validateBlogDocument } from '../utils/blog-document';
import { createBlogSlug } from '../utils/blog-slug';

@Injectable()
export class BlogService {
  constructor(
    private readonly repository: BlogRepository,
    private readonly media: MediaService,
  ) {}

  private async translations(
    input: Array<{ languageId: string; title?: string }>,
  ) {
    const languages = await this.repository.languages();
    const ids = input.map((item) => item.languageId);
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !languages.some((language) => language.id === id))
    )
      throw new BadRequestException('زبان های مقاله معتبر نیستند.');
    const persian = languages.find((language) => language.code === 'fa');
    if (
      !persian ||
      !input.find((item) => item.languageId === persian.id)?.title?.trim()
    )
      throw new BadRequestException('عنوان فارسی الزامی است.');
    return persian;
  }
  private async constrained<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002')
          throw new ConflictException(
            'عنوان تکراری باعث شناسه صفحه تکراری شده است. عنوان را تغییر دهید.',
          );
        if (error.code === 'P2003')
          throw new BadRequestException(
            'مورد انتخاب شده معتبر نیست یا هنوز در حال استفاده است.',
          );
        if (error.code === 'P2025')
          throw new NotFoundException('مورد پیدا نشد.');
      }
      throw error;
    }
  }
  async article(id: string) {
    const article = await this.repository.article(id);
    if (!article) throw new NotFoundException('مقاله پیدا نشد.');
    return article;
  }
  list(query: BlogListQueryDto) {
    const where: Prisma.BlogArticleWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId
        ? { categories: { some: { categoryId: query.categoryId } } }
        : {}),
      ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      ...(query.search?.trim()
        ? {
            translations: {
              some: { title: { contains: query.search.trim() } },
            },
          }
        : {}),
    };
    return this.repository.articles(where, query.page, query.pageSize);
  }
  private async prepare(
    input: CreateBlogArticleDto,
    gallery: ReadonlyMap<string, string>,
  ) {
    const persian = await this.translations(input.translations);
    if (
      input.categoryIds.length > 0
        ? !input.primaryCategoryId ||
          !input.categoryIds.includes(input.primaryCategoryId)
        : Boolean(input.primaryCategoryId)
    )
      throw new BadRequestException(
        'دسته اصلی باید از دسته بندی های انتخاب شده باشد.',
      );
    if (
      (await this.repository.countCategories(input.categoryIds)) !==
        input.categoryIds.length ||
      (await this.repository.countTags(input.tagIds)) !== input.tagIds.length
    )
      throw new BadRequestException('دسته بندی یا برچسب معتبر نیست.');
    const translations = input.translations.map((item) => {
      const content = validateBlogDocument(item.content, gallery);
      const title = item.title?.trim() || null;
      const slug = title ? createBlogSlug(title, 200) : null;
      if (title && !slug)
        throw new BadRequestException('عنوان باید شامل حرف یا عدد باشد.');
      if (
        item.status === TranslationStatus.PUBLISHED &&
        (!title || !content.hasContent)
      )
        throw new BadRequestException(
          'ترجمه منتشر شده باید عنوان و محتوا داشته باشد.',
        );
      return {
        languageId: item.languageId,
        title,
        slug,
        summary: item.summary?.trim() || null,
        content: content.document,
        seoTitle: item.seoTitle?.trim() || null,
        seoDescription: item.seoDescription?.trim() || null,
        status: item.status,
      };
    });
    if (
      input.status === ContentStatus.PUBLISHED &&
      !translations.some(
        (item) =>
          item.languageId === persian.id &&
          item.status === TranslationStatus.PUBLISHED,
      )
    )
      throw new BadRequestException(
        'برای انتشار مقاله، ترجمه فارسی باید منتشر شده باشد.',
      );
    return translations;
  }
  async create(input: CreateBlogArticleDto) {
    const translations = await this.prepare(input, new Map());
    return this.constrained(() =>
      this.repository.createArticle({
        status: input.status,
        publishedAt:
          input.status === ContentStatus.PUBLISHED ? new Date() : null,
        translations: { create: translations },
        categories: {
          create: input.categoryIds.map((categoryId) => ({
            categoryId,
            isPrimary: categoryId === input.primaryCategoryId,
          })),
        },
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
      }),
    );
  }
  async update(id: string, patch: UpdateBlogArticleDto) {
    const existing = await this.article(id);
    const input: CreateBlogArticleDto = {
      status: patch.status ?? existing.status,
      categoryIds:
        patch.categoryIds ?? existing.categories.map((item) => item.categoryId),
      primaryCategoryId:
        patch.primaryCategoryId !== undefined
          ? patch.primaryCategoryId
          : existing.categories.find((item) => item.isPrimary)?.categoryId,
      tagIds: patch.tagIds ?? existing.tags.map((item) => item.tagId),
      translations:
        patch.translations ??
        existing.translations.map((item): BlogArticleTranslationDto => ({
          languageId: item.languageId,
          title: item.title ?? undefined,
          summary: item.summary ?? undefined,
          content: item.content as Record<string, unknown>,
          seoTitle: item.seoTitle ?? undefined,
          seoDescription: item.seoDescription ?? undefined,
          status: item.status,
        })),
    };
    const gallery = new Map(
      existing.media
        .filter((item) => item.media.path)
        .map((item) => [item.mediaId, `/api/public/media/${item.media.path}`]),
    );
    const translations = await this.prepare(input, gallery);
    return this.constrained(() =>
      this.repository.updateArticle(id, {
        status: input.status,
        publishedAt:
          input.status === ContentStatus.PUBLISHED
            ? (existing.publishedAt ?? new Date())
            : existing.publishedAt,
        translations: { deleteMany: {}, create: translations },
        categories: {
          deleteMany: {},
          create: input.categoryIds.map((categoryId) => ({
            categoryId,
            isPrimary: categoryId === input.primaryCategoryId,
          })),
        },
        tags: {
          deleteMany: {},
          create: input.tagIds.map((tagId) => ({ tagId })),
        },
      }),
    );
  }
  async archive(id: string) {
    await this.article(id);
    await this.repository.updateArticle(id, { status: ContentStatus.ARCHIVED });
  }
  async remove(id: string) {
    const article = await this.article(id);
    await this.repository.deleteArticle(id);
    let cleanupComplete = true;
    for (const item of article.media) {
      try {
        cleanupComplete =
          (await this.media.remove(item.mediaId, { skipIfReferenced: true })) &&
          cleanupComplete;
      } catch {
        cleanupComplete = false;
      }
    }
    return { cleanupComplete };
  }
  async gallery(id: string, input: UpdateBlogGalleryDto) {
    const article = await this.article(id);
    const assets = await this.repository.media(input.mediaIds);
    if (
      assets.length !== input.mediaIds.length ||
      assets.some(
        (asset) =>
          asset.kind !== MediaKind.IMAGE ||
          asset.processingStatus !== MediaProcessingStatus.READY ||
          !asset.path ||
          asset.articleMedia.some((item) => item.articleId !== id) ||
          asset._count.productMedia ||
          asset._count.productCovers ||
          asset._count.categoryImages,
      )
    )
      throw new BadRequestException(
        'تصاویر گالری معتبر نیستند یا متعلق به بخش دیگری هستند.',
      );
    if (input.coverMediaId && !input.mediaIds.includes(input.coverMediaId))
      throw new BadRequestException('تصویر شاخص باید از گالری مقاله باشد.');
    const removed = article.media.filter(
      (item) => !input.mediaIds.includes(item.mediaId),
    );
    if (removed.length)
      throw new BadRequestException(
        'برای حذف تصویر از دکمه حذف اختصاصی استفاده کنید.',
      );
    const coverMediaId =
      input.coverMediaId !== undefined
        ? input.coverMediaId
        : (article.coverMediaId ?? input.mediaIds[0] ?? null);
    return this.constrained(() =>
      this.repository.updateArticle(id, {
        coverMediaId,
        media: {
          deleteMany: {},
          create: input.mediaIds.map((mediaId, displayOrder) => ({
            mediaId,
            displayOrder,
          })),
        },
      }),
    );
  }
  async removeImage(id: string, mediaId: string) {
    const article = await this.article(id);
    if (!article.media.some((item) => item.mediaId === mediaId))
      throw new NotFoundException('تصویر در گالری مقاله پیدا نشد.');
    const gallery = new Map(
      article.media.map((item) => [
        item.mediaId,
        `/api/public/media/${item.media.path}`,
      ]),
    );
    if (
      article.translations.some((translation) =>
        validateBlogDocument(translation.content, gallery).imageIds.includes(
          mediaId,
        ),
      )
    )
      throw new BadRequestException(
        'ابتدا تصویر را از محتوای ترجمه های مقاله بردارید و مقاله را ذخیره کنید.',
      );
    const coverMediaId =
      article.coverMediaId === mediaId
        ? (article.media.find((item) => item.mediaId !== mediaId)?.mediaId ??
          null)
        : article.coverMediaId;
    await this.repository.updateArticle(id, {
      coverMediaId,
      media: { deleteMany: { mediaId } },
    });
    try {
      return {
        removedFromStorage: await this.media.remove(mediaId, {
          skipIfReferenced: true,
        }),
        coverMediaId,
      };
    } catch {
      return { removedFromStorage: false, coverMediaId };
    }
  }
  categories() {
    return this.repository.categories();
  }
  tags() {
    return this.repository.tags();
  }
  private async taxonomyTranslations(input: BlogTaxonomyTranslationDto[]) {
    await this.translations(input);
    return input.map((item) => {
      const title = item.title.trim();
      const slug = createBlogSlug(title);
      if (!slug)
        throw new BadRequestException('عنوان باید شامل حرف یا عدد باشد.');
      return {
        languageId: item.languageId,
        title,
        slug,
        description: item.description?.trim() || null,
        seoTitle: item.seoTitle?.trim() || null,
        seoDescription: item.seoDescription?.trim() || null,
      };
    });
  }
  async createTaxonomy(
    kind: 'categories' | 'tags',
    input: CreateBlogTaxonomyDto,
  ) {
    const translations = await this.taxonomyTranslations(input.translations);
    return this.constrained(() =>
      kind === 'categories'
        ? this.repository.createCategory({
            isActive: input.isActive,
            translations: { create: translations },
          })
        : this.repository.createTag({
            isActive: input.isActive,
            translations: {
              create: translations.map(({ languageId, title, slug }) => ({
                languageId,
                title,
                slug,
              })),
            },
          }),
    );
  }
  async updateTaxonomy(
    kind: 'categories' | 'tags',
    id: string,
    input: UpdateBlogTaxonomyDto,
  ) {
    const existing =
      kind === 'categories'
        ? await this.repository.category(id)
        : await this.repository.tag(id);
    if (!existing) throw new NotFoundException('مورد پیدا نشد.');
    const translations = input.translations
      ? await this.taxonomyTranslations(input.translations)
      : undefined;
    return this.constrained(() =>
      kind === 'categories'
        ? this.repository.updateCategory(id, {
            isActive: input.isActive,
            ...(translations
              ? { translations: { deleteMany: {}, create: translations } }
              : {}),
          })
        : this.repository.updateTag(id, {
            isActive: input.isActive,
            ...(translations
              ? {
                  translations: {
                    deleteMany: {},
                    create: translations.map(({ languageId, title, slug }) => ({
                      languageId,
                      title,
                      slug,
                    })),
                  },
                }
              : {}),
          }),
    );
  }
  async removeTaxonomy(kind: 'categories' | 'tags', id: string) {
    const existing =
      kind === 'categories'
        ? await this.repository.category(id)
        : await this.repository.tag(id);
    if (!existing) throw new NotFoundException('مورد پیدا نشد.');
    if (existing._count.articles)
      throw new BadRequestException(
        'این مورد در مقاله استفاده شده است و قابل حذف نیست.',
      );
    return this.constrained(() =>
      kind === 'categories'
        ? this.repository.deleteCategory(id)
        : this.repository.deleteTag(id),
    );
  }
  async reorder(kind: 'articles' | 'categories' | 'tags', ids: string[]) {
    if (!(await this.repository.reorder(kind, ids)))
      throw new BadRequestException('فهرست ترتیب معتبر نیست.');
  }

  private async publicLanguage(code: string) {
    const language = (await this.repository.languages()).find(
      (item) => item.code === code,
    );
    if (!language) throw new NotFoundException('زبان فعال پیدا نشد.');
    return language;
  }

  async publicList(query: PublicBlogListQueryDto) {
    const language = await this.publicLanguage(query.language);
    const result = await this.repository.articles(
      {
        status: ContentStatus.PUBLISHED,
        translations: {
          some: {
            languageId: language.id,
            status: TranslationStatus.PUBLISHED,
            ...(query.search?.trim()
              ? { title: { contains: query.search.trim() } }
              : {}),
          },
        },
        ...(query.categoryId
          ? {
              categories: {
                some: {
                  categoryId: query.categoryId,
                  category: { isActive: true },
                },
              },
            }
          : {}),
        ...(query.tagId
          ? { tags: { some: { tagId: query.tagId, tag: { isActive: true } } } }
          : {}),
      },
      query.page,
      query.pageSize,
    );
    const covers = await this.repository.covers(
      result.items.flatMap((item) =>
        item.coverMediaId ? [item.coverMediaId] : [],
      ),
    );
    return {
      ...result,
      items: result.items.map((item) => {
        const translation = item.translations.find(
          (entry) => entry.languageId === language.id,
        );
        const cover = covers.find((entry) => entry.id === item.coverMediaId);
        return {
          id: item.id,
          title: translation?.title,
          slug: translation?.slug,
          summary: translation?.summary,
          publishedAt: item.publishedAt,
          cover: cover
            ? {
                ...cover,
                translations: cover.translations.filter(
                  (entry) => entry.languageId === language.id,
                ),
              }
            : null,
        };
      }),
    };
  }

  async publicTaxonomy(kind: 'categories' | 'tags', code: string) {
    const language = await this.publicLanguage(code);
    const rows =
      kind === 'categories'
        ? await this.repository.categories()
        : await this.repository.tags();
    return rows
      .filter((item) => item.isActive)
      .flatMap((item) => {
        const translation = item.translations.find(
          (entry) => entry.languageId === language.id,
        );
        return translation
          ? [{ id: item.id, title: translation.title, slug: translation.slug }]
          : [];
      });
  }

  async publicDetail(code: string, slug: string) {
    const language = await this.publicLanguage(code);
    const article = await this.repository.publicArticle(language.id, slug);
    if (!article) throw new NotFoundException('مقاله منتشر شده پیدا نشد.');
    const translation = article.translations.find(
      (item) =>
        item.languageId === language.id &&
        item.status === TranslationStatus.PUBLISHED,
    );
    if (!translation) throw new NotFoundException('ترجمه مقاله پیدا نشد.');
    const [categories, tags] = await Promise.all([
      this.publicTaxonomy('categories', code),
      this.publicTaxonomy('tags', code),
    ]);
    const primary = article.categories.find((item) => item.isPrimary);
    const relatedRows = primary
      ? await this.repository.publicRelated(
          language.id,
          article.id,
          primary.categoryId,
        )
      : [];
    const covers = await this.repository.covers(
      relatedRows.flatMap((item) =>
        item.coverMediaId ? [item.coverMediaId] : [],
      ),
    );
    const activeLanguages = await this.repository.languages();
    return {
      id: article.id,
      title: translation.title,
      slug: translation.slug,
      summary: translation.summary,
      content: translation.content,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      publishedAt: article.publishedAt,
      coverMediaId: article.coverMediaId,
      translations: article.translations.flatMap((item) => {
        const active = activeLanguages.find(
          (entry) => entry.id === item.languageId,
        );
        return active &&
          item.status === TranslationStatus.PUBLISHED &&
          item.slug &&
          item.title
          ? [{ language: active.code, slug: item.slug, title: item.title }]
          : [];
      }),
      categories: categories
        .filter((item) =>
          article.categories.some((entry) => entry.categoryId === item.id),
        )
        .map((item) => ({
          ...item,
          isPrimary: item.id === primary?.categoryId,
        })),
      tags: tags.filter((item) =>
        article.tags.some((entry) => entry.tagId === item.id),
      ),
      media: article.media.map((item) => ({
        ...item.media,
        translations: item.media.translations.filter(
          (entry) => entry.languageId === language.id,
        ),
      })),
      related: relatedRows.map((item) => {
        const translated = item.translations[0];
        const cover = covers.find((entry) => entry.id === item.coverMediaId);
        return {
          id: item.id,
          title: translated?.title,
          slug: translated?.slug,
          summary: translated?.summary,
          cover: cover
            ? {
                ...cover,
                translations: cover.translations.filter(
                  (entry) => entry.languageId === language.id,
                ),
              }
            : null,
        };
      }),
    };
  }
}
