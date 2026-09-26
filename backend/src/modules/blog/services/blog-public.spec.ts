import { NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogRepository } from '../repositories/blog.repository';
import { MediaService } from '../../media/services/media.service';

describe('Blog public projection', () => {
  const repository = {
    languages: jest.fn(),
    articles: jest.fn(),
    covers: jest.fn(),
    categories: jest.fn(),
    tags: jest.fn(),
    publicArticle: jest.fn(),
    publicRelated: jest.fn(),
  };
  const service = new BlogService(
    repository as unknown as BlogRepository,
    {} as MediaService,
  );
  const article = {
    id: 'article',
    status: 'PUBLISHED',
    coverMediaId: null,
    publishedAt: new Date('2026-09-26T00:00:00Z'),
    translations: [
      {
        languageId: 'fa-id',
        title: 'مقاله',
        slug: 'مقاله',
        summary: 'خلاصه',
        status: 'PUBLISHED',
        content: { type: 'doc', content: [] },
        seoTitle: null,
        seoDescription: null,
      },
      {
        languageId: 'en-id',
        title: 'Private draft',
        slug: 'private-draft',
        summary: 'Private summary',
        status: 'DRAFT',
        content: { type: 'doc', content: [] },
      },
    ],
    categories: [],
    tags: [],
    media: [],
  };

  beforeEach(() => {
    jest.resetAllMocks();
    repository.languages.mockResolvedValue([
      { id: 'fa-id', code: 'fa', name: 'فارسی' },
      { id: 'en-id', code: 'en', name: 'English' },
    ]);
    repository.covers.mockResolvedValue([]);
    repository.categories.mockResolvedValue([]);
    repository.tags.mockResolvedValue([]);
    repository.publicArticle.mockResolvedValue(article);
    repository.publicRelated.mockResolvedValue([]);
  });

  it('limits list queries to the published requested translation and projects no drafts', async () => {
    repository.articles.mockResolvedValue({
      items: [article],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const result = await service.publicList({
      language: 'fa',
      search: ' مقاله ',
      page: 1,
      pageSize: 20,
    });
    expect(repository.articles).toHaveBeenCalledWith(
      {
        status: 'PUBLISHED',
        translations: {
          some: {
            languageId: 'fa-id',
            status: 'PUBLISHED',
            title: { contains: 'مقاله' },
          },
        },
      },
      1,
      20,
    );
    expect(result.items[0]).toMatchObject({ title: 'مقاله', slug: 'مقاله' });
    expect(JSON.stringify(result)).not.toContain('Private');
    expect(result.items[0]).not.toHaveProperty('content');
    expect(result.items[0]).not.toHaveProperty('translations');
  });

  it('has no related lookup when an article has no category', async () => {
    const result = await service.publicDetail('fa', 'مقاله');
    expect(repository.publicArticle).toHaveBeenCalledWith('fa-id', 'مقاله');
    expect(repository.publicRelated).not.toHaveBeenCalled();
    expect(result.related).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('Private');
  });

  it('uses the primary category rather than other article categories for related articles', async () => {
    repository.publicArticle.mockResolvedValue({
      ...article,
      categories: [
        { categoryId: 'secondary', isPrimary: false },
        { categoryId: 'primary', isPrimary: true },
      ],
    });
    await service.publicDetail('fa', 'مقاله');
    expect(repository.publicRelated).toHaveBeenCalledWith(
      'fa-id',
      'article',
      'primary',
    );
  });

  it('does not expose detail content for an unpublished translation', async () => {
    await expect(service.publicDetail('en', 'private-draft')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects unavailable languages before reading articles', async () => {
    await expect(service.publicDetail('de', 'article')).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.publicArticle).not.toHaveBeenCalled();
  });

  it('exposes only active taxonomy entries translated to the requested language', async () => {
    repository.tags.mockResolvedValue([
      {
        id: 'visible',
        isActive: true,
        translations: [{ languageId: 'fa-id', title: 'برچسب', slug: 'برچسب' }],
      },
      {
        id: 'hidden',
        isActive: false,
        translations: [{ languageId: 'fa-id', title: 'پنهان', slug: 'پنهان' }],
      },
      {
        id: 'untranslated',
        isActive: true,
        translations: [
          { languageId: 'en-id', title: 'English', slug: 'english' },
        ],
      },
    ]);
    expect(await service.publicTaxonomy('tags', 'fa')).toEqual([
      { id: 'visible', title: 'برچسب', slug: 'برچسب' },
    ]);
  });
});
