import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';

type JsonObject = Prisma.InputJsonObject;
const blocks = new Set([
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  'horizontalRule',
  'image',
  'table',
]);
const childTypes: Record<string, Set<string>> = {
  doc: blocks,
  paragraph: new Set(['text', 'hardBreak']),
  heading: new Set(['text', 'hardBreak']),
  bulletList: new Set(['listItem']),
  orderedList: new Set(['listItem']),
  listItem: new Set(['paragraph', 'bulletList', 'orderedList', 'blockquote']),
  blockquote: blocks,
  table: new Set(['tableRow']),
  tableRow: new Set(['tableCell', 'tableHeader']),
  tableCell: new Set([
    'paragraph',
    'heading',
    'bulletList',
    'orderedList',
    'blockquote',
    'image',
  ]),
  tableHeader: new Set([
    'paragraph',
    'heading',
    'bulletList',
    'orderedList',
    'blockquote',
    'image',
  ]),
};
const fail = (): never => {
  throw new BadRequestException('ساختار محتوای مقاله معتبر نیست.');
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  return value as Record<string, unknown>;
}
function text(value: unknown, maximum: number): string {
  if (typeof value !== 'string' || value.length > maximum) fail();
  return value as string;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) fail();
}
function integer(value: unknown, minimum: number, maximum: number): number {
  if (
    !Number.isInteger(value) ||
    Number(value) < minimum ||
    Number(value) > maximum
  )
    fail();
  return Number(value);
}

/** Rebuild a whitelisted document; image URLs come from trusted gallery records. */
export function validateBlogDocument(
  input: unknown,
  gallery: ReadonlyMap<string, string>,
): {
  document: JsonObject;
  hasContent: boolean;
  imageIds: string[];
} {
  let nodes = 0;
  let textLength = 0;
  let hasContent = false;
  const imageIds = new Set<string>();
  function visit(
    raw: unknown,
    parent: string | null,
    depth: number,
  ): JsonObject {
    if (++nodes > 10000 || depth > 32) fail();
    const node = object(raw);
    keys(node, ['type', 'attrs', 'content', 'marks', 'text']);
    const type = text(node.type, 40);
    if (parent === null ? type !== 'doc' : !childTypes[parent]?.has(type))
      fail();
    const result: Record<string, Prisma.InputJsonValue> = { type };
    const attrs = node.attrs === undefined ? {} : object(node.attrs);
    if (type === 'text') {
      keys(node, ['type', 'text', 'marks']);
      const value = text(node.text, 100000);
      if (!value) fail();
      textLength += value.length;
      if (textLength > 1000000) fail();
      hasContent ||= Boolean(value.trim());
      result.text = value;
      if (node.marks !== undefined) {
        if (!Array.isArray(node.marks) || node.marks.length > 6) fail();
        const seen = new Set<string>();
        result.marks = (node.marks as unknown[]).map((rawMark) => {
          const mark = object(rawMark);
          keys(mark, ['type', 'attrs']);
          const markType = text(mark.type, 30);
          if (seen.has(markType)) fail();
          seen.add(markType);
          if (markType === 'link') {
            const link = object(mark.attrs);
            keys(link, ['href', 'target', 'rel', 'class']);
            const href = text(link.href, 2000);
            if (!/^https?:\/\//i.test(href)) fail();
            try {
              const url = new URL(href);
              if (!url.hostname || url.username || url.password) fail();
            } catch {
              fail();
            }
            return {
              type: 'link',
              attrs: { href, target: '_blank', rel: 'noopener noreferrer' },
            };
          }
          if (
            !['bold', 'italic', 'underline', 'strike', 'code'].includes(
              markType,
            ) ||
            mark.attrs !== undefined
          )
            fail();
          return { type: markType };
        });
      }
      return result;
    }
    if (node.text !== undefined || node.marks !== undefined) fail();
    if (type === 'heading') {
      keys(attrs, ['level']);
      result.attrs = { level: integer(attrs.level, 2, 4) };
    } else if (type === 'orderedList') {
      keys(attrs, ['start', 'type']);
      result.attrs = { start: integer(attrs.start ?? 1, 1, 1000000) };
    } else if (type === 'image') {
      keys(attrs, ['src', 'mediaId', 'alt', 'title', 'width', 'height']);
      const mediaId = text(attrs.mediaId, 191);
      const src = gallery.get(mediaId);
      if (!src)
        throw new BadRequestException(
          'تصویر باید از گالری همین مقاله انتخاب شود.',
        );
      imageIds.add(mediaId);
      hasContent = true;
      result.attrs = {
        mediaId,
        src,
        alt: attrs.alt == null ? '' : text(attrs.alt, 500),
        title: attrs.title == null ? '' : text(attrs.title, 255),
      };
    } else if (type === 'tableCell' || type === 'tableHeader') {
      keys(attrs, ['colspan', 'rowspan', 'colwidth', 'align']);
      const colspan = integer(attrs.colspan ?? 1, 1, 100);
      const rowspan = integer(attrs.rowspan ?? 1, 1, 100);
      if (attrs.colwidth != null) {
        if (!Array.isArray(attrs.colwidth) || attrs.colwidth.length !== colspan)
          fail();
        (attrs.colwidth as unknown[]).forEach((width) =>
          integer(width, 0, 10000),
        );
      }
      if (
        attrs.align != null &&
        (typeof attrs.align !== 'string' ||
          !['left', 'center', 'right'].includes(attrs.align))
      )
        fail();
      result.attrs = {
        colspan,
        rowspan,
        colwidth: attrs.colwidth == null ? null : attrs.colwidth,
        ...(typeof attrs.align === 'string' ? { align: attrs.align } : {}),
      };
    } else {
      keys(attrs, []);
    }
    if (childTypes[type]) {
      if (!Array.isArray(node.content) || node.content.length > 10000) {
        if (
          (type === 'paragraph' || type === 'heading') &&
          node.content === undefined
        )
          return result;
        fail();
      }
      const content = (node.content as unknown[]).map((child) =>
        visit(child, type, depth + 1),
      );
      if (
        !['paragraph', 'heading', 'tableRow'].includes(type) &&
        content.length === 0
      )
        fail();
      if (
        type === 'listItem' &&
        (content[0] as JsonObject).type !== 'paragraph'
      )
        fail();
      result.content = content;
      if (type === 'table') validateTable(content);
    } else if (node.content !== undefined) fail();
    return result;
  }
  const document = visit(input, null, 0);
  return { document, hasContent, imageIds: [...imageIds] };
}

function validateTable(rows: JsonObject[]) {
  const grid: boolean[][] = rows.map(() => []);
  let columns = 0;
  rows.forEach((row, rowIndex) => {
    const occupied = grid[rowIndex];
    if (!occupied) fail();
    let column = 0;
    for (const cell of row.content as JsonObject[]) {
      while (occupied![column]) column++;
      const attrs = cell.attrs as JsonObject;
      const colspan = Number(attrs.colspan);
      const rowspan = Number(attrs.rowspan);
      if (rowIndex + rowspan > rows.length || column + colspan > 100) fail();
      for (let y = rowIndex; y < rowIndex + rowspan; y++) {
        const target = grid[y];
        if (!target) fail();
        for (let x = column; x < column + colspan; x++) {
          if (target![x]) fail();
          target![x] = true;
        }
      }
      column += colspan;
    }
    if (rowIndex === 0) columns = occupied!.length;
    if (
      !columns ||
      occupied!.length !== columns ||
      Array.from({ length: columns }, (_, index) => occupied![index]).some(
        (value) => !value,
      )
    )
      fail();
  });
}
