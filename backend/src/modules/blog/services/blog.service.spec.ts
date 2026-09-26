import { BadRequestException } from '@nestjs/common';
import {
  ContentStatus,
  TranslationStatus,
} from '../../../generated/prisma/client';
import { MediaService } from '../../media/services/media.service';
import { BlogRepository } from '../repositories/blog.repository';
import { BlogService } from './blog.service';
import type { CreateBlogArticleDto } from '../dto/blog.dto';

const form = (): CreateBlogArticleDto => ({
  status: ContentStatus.DRAFT,
  categoryIds: [],
  tagIds: [],
  translations: [
    {
      languageId: 'fa',
      title: 'مقاله آزمایشی',
      status: TranslationStatus.DRAFT,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    },
  ],
});
function setup() {
  const repository = {
    languages: jest.fn().mockResolvedValue([
      { id: 'fa', code: 'fa', name: 'فارسی' },
      { id: 'en', code: 'en', name: 'English' },
    ]),
    countCategories: jest.fn().mockResolvedValue(0),
    countTags: jest.fn().mockResolvedValue(0),
    createArticle: jest
      .fn()
      .mockImplementation((value: unknown) => Promise.resolve(value)),
  };
  return {
    repository,
    service: new BlogService(
      repository as unknown as BlogRepository,
      {} as MediaService,
    ),
  };
}
describe('Blog publication', () => {
  it('creates Persian drafts without category or nonempty body', async () => {
    const { service, repository } = setup();
    await service.create(form());
    expect(repository.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        translations: {
          create: [expect.objectContaining({ slug: 'مقاله-آزمایشی' })],
        },
      }),
    );
  });
  it('requires a Persian title even for drafts', async () => {
    const { service } = setup();
    const input = form();
    input.translations[0]!.title = '';
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
  it('requires publication of Persian translation', async () => {
    const { service } = setup();
    const input = form();
    input.status = ContentStatus.PUBLISHED;
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
  it('requires content before publishing a translation', async () => {
    const { service } = setup();
    const input = form();
    input.translations[0]!.status = TranslationStatus.PUBLISHED;
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
  it('requires a selected primary category when categories are assigned', async () => {
    const { service } = setup();
    const input = form();
    input.categoryIds = ['category'];
    input.primaryCategoryId = 'foreign';
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
  it('rejects duplicate or inactive language IDs', async () => {
    const { service } = setup();
    const input = form();
    input.translations.push({ ...input.translations[0]! });
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
    input.translations = [
      { ...input.translations[0]!, languageId: 'inactive' },
    ];
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });
});
