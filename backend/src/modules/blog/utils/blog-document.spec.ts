import { BadRequestException } from '@nestjs/common';
import { validateBlogDocument } from './blog-document';
import { createBlogSlug } from './blog-slug';

const paragraph = (value = 'محتوای آزمایشی') => ({
  type: 'paragraph',
  content: [{ type: 'text', text: value }],
});
const doc = (...content: unknown[]) => ({ type: 'doc', content });
describe('Blog documents', () => {
  it('accepts empty drafts and detects nonempty text', () => {
    expect(
      validateBlogDocument(doc({ type: 'paragraph' }), new Map()).hasContent,
    ).toBe(false);
    expect(validateBlogDocument(doc(paragraph()), new Map()).hasContent).toBe(
      true,
    );
  });
  it('accepts headings, lists and blockquotes', () => {
    const input = doc(
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'عنوان' }],
      },
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph()] }],
      },
      { type: 'blockquote', content: [paragraph()] },
    );
    expect(validateBlogDocument(input, new Map()).document).toEqual(input);
  });
  it('rejects invalid structure, unexpected attrs and unsafe links', () => {
    const inputs = [
      doc({ type: 'script' }),
      doc({ type: 'paragraph', attrs: { onclick: 'alert(1)' } }),
      doc({ type: 'heading', attrs: { level: 1 } }),
      doc({ type: 'text', text: 'wrong place' }),
      doc({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'link',
            marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
          },
        ],
      }),
    ];
    for (const input of inputs)
      expect(() => validateBlogDocument(input, new Map())).toThrow(
        BadRequestException,
      );
  });
  it('rebuilds image URLs from owned media instead of client input', () => {
    const result = validateBlogDocument(
      doc({
        type: 'image',
        attrs: {
          mediaId: 'owned',
          src: 'javascript:alert(1)',
          alt: 'تصویر',
          title: null,
          width: null,
          height: null,
        },
      }),
      new Map([['owned', '/api/public/media/owned/image.webp']]),
    );
    expect(result.imageIds).toEqual(['owned']);
    expect(result.document.content).toEqual([
      {
        type: 'image',
        attrs: {
          mediaId: 'owned',
          src: '/api/public/media/owned/image.webp',
          alt: 'تصویر',
          title: '',
        },
      },
    ]);
    expect(result.hasContent).toBe(true);
  });
  it('rejects images belonging to another article', () => {
    expect(() =>
      validateBlogDocument(
        doc({ type: 'image', attrs: { mediaId: 'foreign', src: '/test.png' } }),
        new Map(),
      ),
    ).toThrow(BadRequestException);
  });
  it('accepts tables with normalized attributes', () => {
    const table = {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null, align: null },
              content: [paragraph()],
            },
          ],
        },
      ],
    };
    const result = validateBlogDocument(doc(table), new Map());
    expect(result.hasContent).toBe(true);
  });
  it('rejects deeply nested content', () => {
    let node: unknown = paragraph();
    for (let index = 0; index < 40; index++)
      node = { type: 'blockquote', content: [node] };
    expect(() => validateBlogDocument(doc(node), new Map())).toThrow(
      BadRequestException,
    );
  });
  it('rejects malformed table grids and accepts vertical merged cells', () => {
    const cell = (colspan = 1, rowspan = 1) => ({
      type: 'tableCell',
      attrs: { colspan, rowspan },
      content: [paragraph()],
    });
    expect(() =>
      validateBlogDocument(
        doc({
          type: 'table',
          content: [
            { type: 'tableRow', content: [cell(), cell()] },
            { type: 'tableRow', content: [cell()] },
          ],
        }),
        new Map(),
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      validateBlogDocument(
        doc({
          type: 'table',
          content: [{ type: 'tableRow', content: [cell(1, 3)] }],
        }),
        new Map(),
      ),
    ).toThrow(BadRequestException);
    expect(
      validateBlogDocument(
        doc({
          type: 'table',
          content: [
            { type: 'tableRow', content: [cell(1, 2)] },
            { type: 'tableRow', content: [] },
          ],
        }),
        new Map(),
      ).hasContent,
    ).toBe(true);
  });
  it('generates slugs for multilingual titles and updates them with titles', () => {
    expect(createBlogSlug('  حوله خشک کن / استیل  ')).toBe('حوله-خشک-کن-استیل');
    expect(createBlogSlug('Steel radiator #2')).toBe('steel-radiator-2');
    expect(createBlogSlug('Crème brûlée')).toBe('crème-brûlée');
    expect(createBlogSlug('new title')).not.toBe(createBlogSlug('old title'));
    expect(createBlogSlug('a'.repeat(300))).toHaveLength(180);
  });
});
