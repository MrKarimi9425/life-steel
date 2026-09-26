import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductPricingRepository } from '../repositories/product-pricing.repository';
import type { UpdateProductPricingDto } from '../dto/product-pricing.dto';

@Injectable()
export class ProductPricingService {
  constructor(private readonly repository: ProductPricingRepository) {}
  async get(id: string) {
    const row = await this.repository.find(id);
    if (!row) throw new NotFoundException('محصول پیدا نشد.');
    return this.adminPricing(row);
  }
  private adminPricing(
    row: NonNullable<Awaited<ReturnType<ProductPricingRepository['find']>>>,
  ) {
    const colors = row.attributeValues.flatMap((value) =>
      value.selectedOptions.map(({ option }) => ({
        ...option,
        mediaIds: row.colorImages
          .filter((image) => image.optionId === option.id)
          .map((image) => image.mediaId),
        primaryMediaId:
          row.colorImages.find(
            (image) => image.optionId === option.id && image.isPrimary,
          )?.mediaId ?? null,
        amount:
          row.colorPrices
            .find((price) => price.optionId === option.id)
            ?.amount.toString() ?? null,
      })),
    );
    return {
      showPrice: row.showPrice,
      basePrice: row.basePrice?.toString() ?? null,
      colors,
      images: row.media
        .map((item) => item.media)
        .filter((media) => media.kind === 'IMAGE' && media.path),
    };
  }
  async update(id: string, input: UpdateProductPricingDto) {
    const current = await this.get(id);
    if (
      input.colors.some(
        (color) =>
          !current.colors.some((option) => option.id === color.optionId),
      )
    ) {
      throw new BadRequestException(
        'قیمت فقط برای رنگ های انتخاب شده همین محصول مجاز است.',
      );
    }
    for (const color of input.colors) {
      if (
        color.mediaIds?.some(
          (id) => !current.images.some((image) => image.id === id),
        )
      )
        throw new BadRequestException(
          'تصویر باید از گالری همین محصول انتخاب شود.',
        );
      if (
        color.mediaIds?.length &&
        (!color.primaryMediaId ||
          !color.mediaIds.includes(color.primaryMediaId))
      )
        throw new BadRequestException(
          'تصویر اصلی رنگ را از تصاویر انتخاب شده مشخص کنید.',
        );
      if (
        color.primaryMediaId &&
        !color.mediaIds?.includes(color.primaryMediaId)
      )
        throw new BadRequestException(
          'تصویر اصلی باید در تصاویر انتخاب شده رنگ باشد.',
        );
    }
    await this.repository.save(id, input);
    return this.get(id);
  }
  async publicPricing(id: string, languageId: string) {
    const pricing = await this.get(id);
    return this.publicProjection(pricing, languageId);
  }
  async publicPricings(ids: string[], languageId: string) {
    const rows = ids.length ? await this.repository.findMany(ids) : [];
    return new Map(
      rows.map((row) => [
        row.id,
        this.publicProjection(this.adminPricing(row), languageId),
      ]),
    );
  }
  private publicProjection(
    pricing: ReturnType<ProductPricingService['adminPricing']>,
    languageId: string,
  ) {
    const colors = pricing.colors.map((color) => ({
      id: color.id,
      colorHex: color.colorHex,
      mediaIds: color.mediaIds,
      primaryMediaId: color.primaryMediaId,
      label:
        color.translations.find((item) => item.languageId === languageId)
          ?.label ??
        color.translations[0]?.label ??
        '',
      ...(pricing.showPrice ? { amount: color.amount } : {}),
    }));
    if (!pricing.showPrice) return { showPrice: false, colors };
    const amounts = (
      colors.length
        ? pricing.colors.map((color) => color.amount)
        : [pricing.basePrice]
    )
      .filter((amount): amount is string => amount !== null)
      .map(BigInt);
    return {
      showPrice: true,
      colors,
      basePrice: colors.length ? null : pricing.basePrice,
      minimum: amounts.length
        ? amounts.reduce((a, b) => (a < b ? a : b)).toString()
        : null,
      maximum: amounts.length
        ? amounts.reduce((a, b) => (a > b ? a : b)).toString()
        : null,
      hasUnpricedColors:
        colors.length > 0 &&
        pricing.colors.some((color) => color.amount === null),
    };
  }
}
