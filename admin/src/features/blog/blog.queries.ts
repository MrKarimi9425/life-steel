import { queryOptions } from '@tanstack/react-query'
import { blogApi } from './blog.api'
import type { ArticleListFilters, BlogTaxonomyKind } from './blog.types'

export const blogKeys = {
    all: ['blog'] as const,
    articles: ['blog', 'articles'] as const,
    article: (id: string | null) => ['blog', 'article', id] as const,
    list: (filters: ArticleListFilters) =>
        ['blog', 'articles', filters] as const,
    taxonomy: (kind: BlogTaxonomyKind) => ['blog', kind] as const,
}

export const articleListOptions = (filters: ArticleListFilters) =>
    queryOptions({
        queryKey: blogKeys.list(filters),
        queryFn: () => blogApi.articles(filters),
        meta: { suppressGlobalError: true },
    })

export const articleDetailOptions = (id: string | null, enabled = true) =>
    queryOptions({
        queryKey: blogKeys.article(id),
        enabled: enabled && Boolean(id),
        meta: { suppressGlobalError: true },
        queryFn: () => {
            if (!id) throw new Error('مقاله انتخاب نشده است.')
            return blogApi.article(id)
        },
    })

export const blogTaxonomyOptions = (kind: BlogTaxonomyKind, enabled = true) =>
    queryOptions({
        queryKey: blogKeys.taxonomy(kind),
        queryFn: () => blogApi.taxonomy(kind),
        enabled,
        meta: { suppressGlobalError: true },
    })
