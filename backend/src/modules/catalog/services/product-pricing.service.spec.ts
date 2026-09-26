import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductPricingService } from './product-pricing.service';
import { ProductPricingRepository } from '../repositories/product-pricing.repository';
import { UpdateProductPricingDto } from '../dto/product-pricing.dto';

function setup(showPrice = true, colors = true) {
  const row = {
    id: 'p',
    showPrice,
    basePrice: BigInt(700),
    colorImages: [{ optionId: 'red', mediaId: 'image', isPrimary: true }],
    media: [{ media: { id: 'image', kind: 'IMAGE', path: 'image.webp' } }],
    colorPrices: [
      { optionId: 'red', amount: BigInt(100) },
      { optionId: 'blue', amount: BigInt(300) },
    ],
    attributeValues: colors
      ? [
          {
            selectedOptions: ['red', 'blue', 'black'].map((id) => ({
              option: {
                id,
                colorHex: '#000000',
                translations: [{ languageId: 'fa', label: id }],
              },
            })),
          },
        ]
      : [],
  };
  const repository = {
    find: jest.fn().mockResolvedValue(row),
    findMany: jest.fn().mockResolvedValue([row]),
    save: jest.fn().mockResolvedValue({ id: 'p' }),
  };
  return {
    row,
    repository,
    service: new ProductPricingService(
      repository as unknown as ProductPricingRepository,
    ),
  };
}
describe('Product pricing', () => {
  it('publishes color images independently of hidden amounts', async () => {
    const { service } = setup(false);
    expect((await service.publicPricing('p', 'fa')).colors[0]).toMatchObject({
      mediaIds: ['image'],
      primaryMediaId: 'image',
    });
  });
  it('accepts image connections without a price', async () => {
    const { service, repository } = setup(false);
    await service.update('p', {
      showPrice: false,
      colors: [
        {
          optionId: 'red',
          amount: null,
          mediaIds: ['image'],
          primaryMediaId: 'image',
        },
      ],
    });
    expect(repository.save).toHaveBeenCalled();
  });
  it.each([
    { mediaIds: ['foreign'], primaryMediaId: 'foreign' },
    { mediaIds: ['image'], primaryMediaId: null },
    { mediaIds: ['image'], primaryMediaId: 'foreign' },
    { mediaIds: [], primaryMediaId: 'image' },
  ])(
    'rejects invalid color image ownership or primary selection %j',
    async (images) => {
      const { service, repository } = setup();
      await expect(
        service.update('p', {
          showPrice: false,
          colors: [{ optionId: 'red', ...images }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    },
  );
  it('loads public list pricing once without exposing hidden amounts', async () => {
    const { service, repository } = setup(false);
    const response = await service.publicPricings(['p'], 'fa');
    expect(repository.findMany).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(response.get('p'))).not.toMatch(
      /amount|basePrice|minimum|maximum/,
    );
    await service.publicPricings([], 'fa');
    expect(repository.findMany).toHaveBeenCalledTimes(1);
  });
  it('returns matching bounds when selected color prices are equal', async () => {
    const { service, row } = setup();
    row.colorPrices.forEach((price) => {
      price.amount = BigInt(100);
    });
    expect(await service.publicPricing('p', 'fa')).toMatchObject({
      minimum: '100',
      maximum: '100',
    });
  });
  it('never exposes any stored amounts when price display is disabled', async () => {
    const { service } = setup(false);
    const response = await service.publicPricing('p', 'fa');
    expect(response.showPrice).toBe(false);
    expect(JSON.stringify(response)).not.toMatch(
      /amount|basePrice|minimum|maximum|100|300|700/,
    );
    expect((await service.get('p')).basePrice).toBe('700');
  });
  it('calculates the range only from priced selected colors', async () => {
    const { service } = setup();
    expect(await service.publicPricing('p', 'fa')).toMatchObject({
      minimum: '100',
      maximum: '300',
      hasUnpricedColors: true,
      colors: [
        { id: 'red', amount: '100' },
        { id: 'blue', amount: '300' },
        { id: 'black', amount: null },
      ],
    });
  });
  it('uses the base price only without selected colors', async () => {
    const { service } = setup(true, false);
    expect(await service.publicPricing('p', 'fa')).toMatchObject({
      basePrice: '700',
      minimum: '700',
      maximum: '700',
      colors: [],
    });
  });
  it('handles colors with no prices as contact only', async () => {
    const { row, service } = setup();
    row.colorPrices = [];
    expect(await service.publicPricing('p', 'fa')).toMatchObject({
      minimum: null,
      maximum: null,
      hasUnpricedColors: true,
    });
  });
  it('rejects prices for a foreign or unselected option', async () => {
    const { repository, service } = setup();
    await expect(
      service.update('p', {
        showPrice: false,
        colors: [{ optionId: 'foreign', amount: '100' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it.each(['0', '-1', '1.5', '1e3', '9999999999999999'])(
    'rejects invalid amount %s',
    async (amount) => {
      const dto = plainToInstance(UpdateProductPricingDto, {
        showPrice: true,
        basePrice: amount,
        colors: [],
      });
      expect((await validate(dto)).length).toBeGreaterThan(0);
    },
  );
  it('allows missing amounts and storing prices without publishing them', async () => {
    const { repository, service } = setup(false);
    await service.update('p', {
      showPrice: false,
      basePrice: null,
      colors: [{ optionId: 'red', amount: '999999999999999' }],
    });
    expect(repository.save).toHaveBeenCalledWith('p', {
      showPrice: false,
      basePrice: null,
      colors: [{ optionId: 'red', amount: '999999999999999' }],
    });
  });
});
