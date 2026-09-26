import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  type Prisma,
  TranslationStatus,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { MediaService } from '../../media/services/media.service';
import type {
  CreateAttributeDto,
  CreateCategoryDto,
  CreateProductDto,
  ProductAttributeValueDto,
  ProductTranslationDto,
  UpdateAttributeDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from '../dto/catalog.dto';
import type {
  ListProductsQueryDto,
  PublicProductsQueryDto,
} from '../dto/list-products-query.dto';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  listCategories() {
    return this.prisma.productCategory.findMany({
      include: {
        translations: { include: { language: true } },
        attributes: true,
        _count: { select: { products: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createCategory(input: CreateCategoryDto) {
    if (input.imageId) await this.media.assertNotBlogMedia([input.imageId]);
    await this.assertRequiredTranslations(input.translations);
    this.assertDistinctLanguages(input.translations);
    try {
      const latest = await this.prisma.productCategory.aggregate({
        _max: { displayOrder: true },
      });
      return await this.prisma.productCategory.create({
        data: {
          isActive: input.isActive,
          displayOrder: (latest._max.displayOrder ?? -1) + 1,
          imageId: input.imageId || null,
          translations: { create: input.translations },
        },
        include: { translations: true },
      });
    } catch (error) {
      this.rethrowConstraintError(error);
    }
  }

  async updateCategory(id: string, input: UpdateCategoryDto) {
    if (input.imageId) await this.media.assertNotBlogMedia([input.imageId]);
    await this.requireCategory(id);
    if (input.translations) {
      await this.assertRequiredTranslations(input.translations);
      this.assertDistinctLanguages(input.translations);
    }
    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: {
          isActive: input.isActive,
          ...(input.imageId !== undefined
            ? { imageId: input.imageId || null }
            : {}),
          ...(input.translations
            ? {
                translations: {
                  deleteMany: {},
                  create: input.translations,
                },
              }
            : {}),
        },
        include: { translations: true },
      });
    } catch (error) {
      this.rethrowConstraintError(error);
    }
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('دسته بندی پیدا نشد.');
    if (category._count.products > 0) {
      throw new BadRequestException(
        'دسته بندی دارای محصول است و قابل حذف نیست.',
      );
    }
    await this.prisma.productCategory.delete({ where: { id } });
  }

  async reorderCategories(ids: string[]) {
    await this.assertCompleteOrder(
      ids,
      this.prisma.productCategory.findMany({ select: { id: true } }),
      'دسته بندی',
    );
    await this.prisma.$transaction(
      ids.map((id, displayOrder) =>
        this.prisma.productCategory.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
  }

  listAttributes() {
    return this.prisma.attributeDefinition.findMany({
      include: {
        translations: { include: { language: true } },
        options: {
          include: { translations: true },
          orderBy: { displayOrder: 'asc' },
        },
        categories: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createAttribute(input: CreateAttributeDto) {
    await this.assertRequiredTranslations(input.translations);
    this.validateAttributeInput(input);
    const latest = await this.prisma.attributeDefinition.aggregate({
      _max: { displayOrder: true },
    });
    return this.prisma.attributeDefinition.create({
      data: {
        type: input.type,
        isFilterable: input.isFilterable,
        isVisible: input.isVisible,
        isActive: input.isActive,
        allowCustomValue: input.allowCustomValue,
        displayOrder: (latest._max.displayOrder ?? -1) + 1,
        translations: { create: input.translations },
        options: {
          create: input.options.map((option, displayOrder) => ({
            colorHex: option.colorHex,
            isActive: option.isActive,
            displayOrder,
            translations: { create: option.translations },
          })),
        },
        categories: {
          create: input.categories.map((category, displayOrder) => ({
            ...category,
            displayOrder,
          })),
        },
      },
      include: {
        translations: true,
        options: { include: { translations: true } },
        categories: true,
      },
    });
  }

  async updateAttribute(id: string, input: UpdateAttributeDto) {
    await this.requireAttribute(id);
    if (input.translations)
      await this.assertRequiredTranslations(input.translations);
    if (input.translations) this.assertDistinctLanguages(input.translations);

    return this.prisma.$transaction(async (transaction) => {
      if (input.options) {
        const usedOptionIds =
          await transaction.productAttributeOptionValue.findMany({
            where: { option: { attributeId: id } },
            select: { optionId: true },
            distinct: ['optionId'],
          });
        const retainedIds = new Set(
          input.options.map((option) => option.id).filter(Boolean),
        );
        if (usedOptionIds.some((item) => !retainedIds.has(item.optionId))) {
          throw new BadRequestException(
            'گزینه استفاده شده در محصولات قابل حذف نیست.',
          );
        }
        await transaction.attributeOption.deleteMany({
          where: {
            attributeId: id,
            id: { notIn: [...retainedIds] as string[] },
          },
        });
        for (const [displayOrder, option] of input.options.entries()) {
          if (option.id) {
            await transaction.attributeOption.update({
              where: { id: option.id },
              data: {
                colorHex: option.colorHex || null,
                isActive: option.isActive,
                displayOrder,
                translations: { deleteMany: {}, create: option.translations },
              },
            });
          } else {
            await transaction.attributeOption.create({
              data: {
                attributeId: id,
                colorHex: option.colorHex || null,
                isActive: option.isActive,
                displayOrder,
                translations: { create: option.translations },
              },
            });
          }
        }
      }

      return transaction.attributeDefinition.update({
        where: { id },
        data: {
          type: input.type,
          isFilterable: input.isFilterable,
          isVisible: input.isVisible,
          isActive: input.isActive,
          allowCustomValue: input.allowCustomValue,
          ...(input.translations
            ? { translations: { deleteMany: {}, create: input.translations } }
            : {}),
          ...(input.categories
            ? {
                categories: {
                  deleteMany: {},
                  create: input.categories.map((category, displayOrder) => ({
                    ...category,
                    displayOrder,
                  })),
                },
              }
            : {}),
        },
        include: {
          translations: true,
          options: { include: { translations: true } },
          categories: true,
        },
      });
    });
  }

  async reorderAttributes(ids: string[]) {
    await this.assertCompleteOrder(
      ids,
      this.prisma.attributeDefinition.findMany({ select: { id: true } }),
      'ویژگی',
    );
    await this.prisma.$transaction(
      ids.map((id, displayOrder) =>
        this.prisma.attributeDefinition.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
  }

  async listProducts(query: ListProductsQueryDto) {
    this.validateProductFilters(query);
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId
        ? { categories: { some: { categoryId: query.categoryId } } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { sku: { contains: query.search } },
              { translations: { some: { title: { contains: query.search } } } },
            ],
          }
        : {}),
      ...this.attributeFilter(query),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          translations: { include: { language: true } },
          categories: {
            include: { category: { include: { translations: true } } },
          },
          coverMedia: { include: { variants: true } },
        },
        orderBy:
          query.sort === 'newest'
            ? [{ createdAt: 'desc' as const }]
            : query.sort === 'oldest'
              ? [{ createdAt: 'asc' as const }]
              : [
                  { displayOrder: 'asc' as const },
                  { createdAt: 'desc' as const },
                ],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  listProductOptions() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        sku: true,
        status: true,
        translations: {
          select: {
            languageId: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        translations: { include: { language: true } },
        categories: {
          include: { category: { include: { translations: true } } },
        },
        media: {
          include: {
            media: { include: { variants: true, translations: true } },
          },
          orderBy: { displayOrder: 'asc' },
        },
        attributeValues: {
          include: {
            attribute: {
              include: {
                translations: true,
                options: { include: { translations: true } },
              },
            },
            translations: true,
            selectedOptions: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
        relatedFrom: true,
      },
    });
    if (!product) throw new NotFoundException('محصول پیدا نشد.');
    return product;
  }

  async createProduct(input: CreateProductDto) {
    await this.validateProductInput(input);
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const latest = await transaction.product.aggregate({
          where: { deletedAt: null },
          _max: { displayOrder: true },
        });
        const product = await transaction.product.create({
          data: {
            sku: input.sku || null,
            status: input.status,
            coverMediaId: input.coverMediaId || null,
            isFeatured: input.isFeatured,
            displayOrder: (latest._max.displayOrder ?? -1) + 1,
            publishedAt:
              input.status === ContentStatus.PUBLISHED ? new Date() : null,
            translations: {
              create: this.prepareProductTranslations(input.translations),
            },
            categories: {
              create: input.categoryIds.map((categoryId) => ({
                categoryId,
                isPrimary: categoryId === input.primaryCategoryId,
              })),
            },
            media: {
              create: input.mediaIds.map((mediaId, index) => ({
                mediaId,
                displayOrder: index,
              })),
            },
            relatedFrom: {
              create: input.relatedProductIds.map(
                (relatedProductId, index) => ({
                  relatedProductId,
                  displayOrder: index,
                }),
              ),
            },
          },
        });
        await this.createAttributeValues(
          transaction,
          product.id,
          input.attributeValues,
        );
        return product;
      });
    } catch (error) {
      this.rethrowConstraintError(error);
    }
  }

  async updateProduct(id: string, input: UpdateProductDto) {
    const existing = await this.getProduct(id);
    const finalStatus = input.status ?? existing.status;
    const finalTranslations =
      input.translations ??
      existing.translations.map((item) => ({
        languageId: item.languageId,
        title: item.title ?? undefined,
        slug: item.slug ?? undefined,
        summary: item.summary ?? undefined,
        description: item.description ?? undefined,
        seoTitle: item.seoTitle ?? undefined,
        seoDescription: item.seoDescription ?? undefined,
        status: item.status,
      }));
    if (finalStatus === ContentStatus.PUBLISHED) {
      await this.assertPublishable(finalTranslations);
    }
    if (input.categoryIds) {
      this.assertPrimaryCategory(input.categoryIds, input.primaryCategoryId);
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const customAttributeIds = input.attributeValues
          ? existing.attributeValues
              .filter((value) => value.isCustom)
              .map((value) => value.attributeId)
          : [];
        if (input.attributeValues) {
          await transaction.productAttributeValue.deleteMany({
            where: { productId: id },
          });
        }
        const product = await transaction.product.update({
          where: { id },
          data: {
            sku: input.sku,
            status: input.status,
            ...(input.coverMediaId !== undefined
              ? { coverMediaId: input.coverMediaId || null }
              : {}),
            isFeatured: input.isFeatured,
            ...(input.status === ContentStatus.PUBLISHED &&
            existing.status !== ContentStatus.PUBLISHED
              ? { publishedAt: new Date() }
              : {}),
            ...(input.translations
              ? {
                  translations: {
                    deleteMany: {},
                    create: this.prepareProductTranslations(input.translations),
                  },
                }
              : {}),
            ...(input.categoryIds
              ? {
                  categories: {
                    deleteMany: {},
                    create: input.categoryIds.map((categoryId) => ({
                      categoryId,
                      isPrimary: categoryId === input.primaryCategoryId,
                    })),
                  },
                }
              : {}),
            ...(input.mediaIds
              ? {
                  media: {
                    deleteMany: {},
                    create: input.mediaIds.map((mediaId, index) => ({
                      mediaId,
                      displayOrder: index,
                    })),
                  },
                }
              : {}),
            ...(input.relatedProductIds
              ? {
                  relatedFrom: {
                    deleteMany: {},
                    create: input.relatedProductIds.map(
                      (relatedProductId, index) => ({
                        relatedProductId,
                        displayOrder: index,
                      }),
                    ),
                  },
                }
              : {}),
          },
        });
        if (input.attributeValues) {
          await this.createAttributeValues(
            transaction,
            id,
            input.attributeValues,
          );
          for (const attributeId of customAttributeIds) {
            const count = await transaction.productAttributeValue.count({
              where: { attributeId },
            });
            if (count === 0) {
              await transaction.attributeDefinition.delete({
                where: { id: attributeId },
              });
            }
          }
        }
        return product;
      });
    } catch (error) {
      this.rethrowConstraintError(error);
    }
  }

  async archiveProduct(id: string) {
    await this.getProduct(id);
    await this.prisma.product.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED },
    });
  }

  async deleteProductMedia(productId: string, mediaId: string) {
    const product = await this.getProduct(productId);
    if (
      product.coverMediaId !== mediaId &&
      !product.media.some((item) => item.mediaId === mediaId)
    ) {
      throw new NotFoundException('فایل در گالری این محصول پیدا نشد.');
    }
    const remaining = product.media.filter((item) => item.mediaId !== mediaId);
    const nextCoverId =
      product.coverMediaId === mediaId
        ? (remaining.find((item) => item.media.kind === 'IMAGE')?.mediaId ??
          null)
        : product.coverMediaId;
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        coverMediaId: nextCoverId,
        media: { deleteMany: { mediaId } },
      },
    });
    try {
      return {
        removedFromStorage: await this.media.remove(mediaId, {
          skipIfReferenced: true,
        }),
        coverMediaId: nextCoverId,
      };
    } catch (error) {
      this.logger.warn(
        `Could not remove media ${mediaId} after detaching from product ${productId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return { removedFromStorage: false, coverMediaId: nextCoverId };
    }
  }

  async deleteProduct(id: string) {
    const product = await this.getProduct(id);
    const mediaIds = [
      ...new Set([
        ...(product.coverMediaId ? [product.coverMediaId] : []),
        ...product.media.map((item) => item.mediaId),
      ]),
    ];
    const customAttributeIds = product.attributeValues
      .filter((value) => value.isCustom)
      .map((value) => value.attributeId);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.product.delete({ where: { id } });
      for (const attributeId of customAttributeIds) {
        const count = await transaction.productAttributeValue.count({
          where: { attributeId },
        });
        if (count === 0) {
          await transaction.attributeDefinition.delete({
            where: { id: attributeId },
          });
        }
      }
    });

    for (const mediaId of mediaIds) {
      try {
        await this.media.remove(mediaId, { skipIfReferenced: true });
      } catch (error) {
        this.logger.warn(
          `Could not remove unused media ${mediaId} after product ${id} deletion`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  async reorderProducts(ids: string[]) {
    if (ids.length === 0) return;
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    const selectedIds = new Set(ids);
    const positions = products.flatMap((product, index) =>
      selectedIds.has(product.id) ? [index] : [],
    );
    if (positions.length !== ids.length) {
      throw new BadRequestException('فهرست ترتیب محصولات معتبر نیست.');
    }
    const orderedIds = products.map((product) => product.id);
    positions.forEach((position, index) => {
      orderedIds[position] = ids[index]!;
    });
    await this.prisma.$transaction(
      orderedIds.map((id, displayOrder) =>
        this.prisma.product.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
  }

  async listPublicProducts(query: PublicProductsQueryDto) {
    this.validateProductFilters(query);
    const language = await this.prisma.language.findFirst({
      where: { code: query.language, isActive: true },
    });
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    const where = {
      deletedAt: null,
      status: ContentStatus.PUBLISHED,
      translations: {
        some: {
          languageId: language.id,
          status: TranslationStatus.PUBLISHED,
          ...(query.search ? { title: { contains: query.search } } : {}),
        },
      },
      ...(query.categoryId
        ? { categories: { some: { categoryId: query.categoryId } } }
        : {}),
      ...this.attributeFilter(query),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          sku: true,
          isFeatured: true,
          translations: {
            where: {
              languageId: language.id,
              status: TranslationStatus.PUBLISHED,
            },
          },
          coverMedia: {
            include: {
              variants: true,
              translations: { where: { languageId: language.id } },
            },
          },
          categories: {
            include: {
              category: {
                include: {
                  translations: { where: { languageId: language.id } },
                },
              },
            },
          },
        },
        orderBy:
          query.sort === 'newest'
            ? [{ publishedAt: 'desc' as const }]
            : query.sort === 'oldest'
              ? [{ publishedAt: 'asc' as const }]
              : [
                  { displayOrder: 'asc' as const },
                  { publishedAt: 'desc' as const },
                ],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async listPublicCategories(languageCode: string) {
    const language = await this.prisma.language.findFirst({
      where: { code: languageCode, isActive: true },
      select: { id: true },
    });
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    return this.prisma.productCategory.findMany({
      where: {
        isActive: true,
        translations: { some: { languageId: language.id } },
      },
      select: {
        id: true,
        translations: { where: { languageId: language.id } },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async listPublicFilters(languageCode: string) {
    const language = await this.prisma.language.findFirst({
      where: { code: languageCode, isActive: true },
      select: { id: true },
    });
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    return this.prisma.attributeDefinition.findMany({
      where: {
        isActive: true,
        isFilterable: true,
        translations: { some: { languageId: language.id } },
      },
      select: {
        id: true,
        type: true,
        translations: { where: { languageId: language.id } },
        options: {
          where: { isActive: true },
          select: {
            id: true,
            translations: { where: { languageId: language.id } },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getPublicProduct(languageCode: string, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        translations: {
          some: {
            language: { code: languageCode, isActive: true },
            slug,
            status: TranslationStatus.PUBLISHED,
          },
        },
      },
      include: {
        translations: {
          where: {
            language: { code: languageCode },
            status: TranslationStatus.PUBLISHED,
          },
        },
        coverMedia: {
          include: {
            variants: true,
            translations: { where: { language: { code: languageCode } } },
          },
        },
        categories: {
          include: {
            category: {
              include: {
                translations: { where: { language: { code: languageCode } } },
              },
            },
          },
        },
        media: {
          include: {
            media: {
              include: {
                variants: true,
                translations: { where: { language: { code: languageCode } } },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        attributeValues: {
          where: { attribute: { isVisible: true } },
          include: {
            translations: { where: { language: { code: languageCode } } },
            attribute: {
              include: {
                translations: { where: { language: { code: languageCode } } },
              },
            },
            selectedOptions: {
              include: {
                option: {
                  include: {
                    translations: {
                      where: { language: { code: languageCode } },
                    },
                  },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    if (!product) throw new NotFoundException('محصول پیدا نشد.');
    const primaryCategoryId = product.categories.find(
      (assignment) => assignment.isPrimary,
    )?.categoryId;
    if (!primaryCategoryId) return { ...product, relatedProducts: [] };

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        id: { not: product.id },
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        categories: { some: { categoryId: primaryCategoryId } },
        translations: {
          some: {
            language: { code: languageCode, isActive: true },
            status: TranslationStatus.PUBLISHED,
          },
        },
      },
      select: {
        id: true,
        sku: true,
        isFeatured: true,
        translations: {
          where: {
            language: { code: languageCode },
            status: TranslationStatus.PUBLISHED,
          },
        },
        coverMedia: {
          include: {
            variants: true,
            translations: { where: { language: { code: languageCode } } },
          },
        },
        categories: {
          include: {
            category: {
              include: {
                translations: { where: { language: { code: languageCode } } },
              },
            },
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
    });
    return { ...product, relatedProducts };
  }

  private async createAttributeValues(
    transaction: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    productId: string,
    values: ProductAttributeValueDto[],
  ) {
    for (const value of values) {
      let attributeId = value.attributeId;
      if (value.customDefinition) {
        await this.assertRequiredTranslations(
          value.customDefinition.translations,
        );
        const attribute = await transaction.attributeDefinition.create({
          data: {
            type: value.customDefinition.type,
            isFilterable: false,
            isVisible: true,
            isActive: true,
            allowCustomValue: true,
            translations: { create: value.customDefinition.translations },
          },
        });
        attributeId = attribute.id;
      }
      if (!attributeId)
        throw new BadRequestException('تعریف ویژگی الزامی است.');
      await transaction.productAttributeValue.create({
        data: {
          productId,
          attributeId,
          numberValue: value.numberValue,
          booleanValue: value.booleanValue,
          rawValue: value.rawValue as Prisma.InputJsonValue | undefined,
          isCustom: Boolean(value.customDefinition),
          displayOrder: value.displayOrder,
          translations: { create: value.translations },
          selectedOptions: {
            create: value.optionIds.map((optionId) => ({ optionId })),
          },
        },
      });
    }
  }

  private async validateProductInput(input: CreateProductDto) {
    this.assertDistinctLanguages(input.translations);
    this.assertPrimaryCategory(input.categoryIds, input.primaryCategoryId);
    if (input.status === ContentStatus.PUBLISHED) {
      await this.assertPublishable(input.translations);
    }
    if (input.relatedProductIds.includes('')) {
      throw new BadRequestException('محصول مرتبط معتبر نیست.');
    }
    const mediaIds = [
      ...input.mediaIds,
      ...(input.coverMediaId ? [input.coverMediaId] : []),
    ];
    if (mediaIds.length) await this.media.assertNotBlogMedia(mediaIds);
  }

  private assertPrimaryCategory(
    categoryIds: string[],
    primaryCategoryId?: string,
  ) {
    if (categoryIds.length === 0) {
      throw new BadRequestException('انتخاب حداقل یک دسته بندی الزامی است.');
    }
    if (!primaryCategoryId || !categoryIds.includes(primaryCategoryId)) {
      throw new BadRequestException(
        'دسته بندی اصلی باید از دسته بندی های محصول باشد.',
      );
    }
  }

  private async assertPublishable(translations: ProductTranslationDto[]) {
    const requiredLanguages = await this.prisma.language.findMany({
      where: { isActive: true, isRequiredForPublish: true },
      select: { id: true, name: true },
    });
    for (const language of requiredLanguages) {
      const translation = translations.find(
        (item) => item.languageId === language.id,
      );
      if (
        !translation ||
        !translation.title?.trim() ||
        !translation.slug?.trim() ||
        translation.status !== TranslationStatus.PUBLISHED
      ) {
        throw new BadRequestException(
          `ترجمه ${language.name} برای انتشار الزامی است.`,
        );
      }
    }
  }

  private async assertRequiredTranslations(
    translations: Array<{ languageId: string }>,
  ) {
    const required = await this.prisma.language.findMany({
      where: { isActive: true, isRequiredForPublish: true },
      select: { id: true, name: true },
    });
    for (const language of required) {
      if (!translations.some((item) => item.languageId === language.id)) {
        throw new BadRequestException(`ترجمه ${language.name} الزامی است.`);
      }
    }
  }

  private validateAttributeInput(input: CreateAttributeDto) {
    this.assertDistinctLanguages(input.translations);
    for (const option of input.options)
      this.assertDistinctLanguages(option.translations);
  }

  private assertDistinctLanguages(translations: Array<{ languageId: string }>) {
    const ids = translations.map((item) => item.languageId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('برای هر زبان فقط یک ترجمه مجاز است.');
    }
  }

  private validateProductFilters(query: ListProductsQueryDto): void {
    if (
      (query.optionId ||
        query.minNumber !== undefined ||
        query.maxNumber !== undefined ||
        query.booleanValue !== undefined) &&
      !query.attributeId
    ) {
      throw new BadRequestException(
        'برای فیلتر ویژگی، شناسه ویژگی الزامی است.',
      );
    }
    if (
      query.minNumber !== undefined &&
      query.maxNumber !== undefined &&
      query.minNumber > query.maxNumber
    ) {
      throw new BadRequestException(
        'حداقل مقدار نمیتواند از حداکثر بیشتر باشد.',
      );
    }
  }

  private attributeFilter(
    query: ListProductsQueryDto,
  ): Prisma.ProductWhereInput {
    if (!query.attributeId) return {};
    return {
      attributeValues: {
        some: {
          attributeId: query.attributeId,
          ...(query.optionId
            ? { selectedOptions: { some: { optionId: query.optionId } } }
            : {}),
          ...(query.minNumber !== undefined || query.maxNumber !== undefined
            ? {
                numberValue: {
                  gte: query.minNumber,
                  lte: query.maxNumber,
                },
              }
            : {}),
          ...(query.booleanValue !== undefined
            ? { booleanValue: query.booleanValue }
            : {}),
        },
      },
    };
  }

  private prepareProductTranslations(translations: ProductTranslationDto[]) {
    return translations.map((translation) => {
      const title = translation.title?.trim() || null;
      const slug = translation.slug?.trim() || null;
      if (
        translation.status === TranslationStatus.PUBLISHED &&
        (!title || !slug)
      ) {
        throw new BadRequestException(
          'برای نمایش ترجمه، عنوان و آدرس آن را کامل کنید.',
        );
      }
      return {
        ...translation,
        title,
        slug,
      };
    });
  }

  private async requireCategory(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('دسته بندی پیدا نشد.');
    return category;
  }

  private async requireAttribute(id: string) {
    const attribute = await this.prisma.attributeDefinition.findUnique({
      where: { id },
    });
    if (!attribute) throw new NotFoundException('ویژگی پیدا نشد.');
    return attribute;
  }

  private async assertCompleteOrder(
    ids: string[],
    recordsPromise: Promise<Array<{ id: string }>>,
    entityLabel: string,
  ) {
    const records = await recordsPromise;
    const expectedIds = new Set(records.map((record) => record.id));
    if (
      ids.length !== expectedIds.size ||
      ids.some((id) => !expectedIds.has(id))
    ) {
      throw new BadRequestException(
        `فهرست ترتیب ${entityLabel} ها کامل یا معتبر نیست.`,
      );
    }
  }

  private rethrowConstraintError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        throw new ConflictException('عنوان، آدرس یا کد وارد شده تکراری است.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'یکی از ارتباط های انتخاب شده معتبر نیست.',
        );
      }
    }
    throw error;
  }
}
