import type { BlockEditorContent } from '@/components/shared/BlockEditor'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type TranslationStatus = 'DRAFT' | 'PUBLISHED'
export type BlogTaxonomyKind = 'categories' | 'tags'

export type BlogTranslationSummary = {
    languageId: string
    title: string | null
    slug: string | null
    summary: string | null
    status: TranslationStatus
}

export type BlogTranslation = BlogTranslationSummary & {
    content: BlockEditorContent
    seoTitle: string | null
    seoDescription: string | null
}

export type ArticleListItem = {
    id: string
    status: ArticleStatus
    coverMediaId: string | null
    displayOrder: number
    publishedAt: string | null
    createdAt: string
    updatedAt: string
    translations: BlogTranslationSummary[]
    categories: Array<{ categoryId: string; isPrimary: boolean }>
    tags: Array<{ tagId: string }>
}

export type ArticleGalleryImage = {
    id: string
    kind: 'IMAGE'
    path: string
    width: number | null
    height: number | null
    variants: Array<{
        id: string
        kind: string
        path: string
        width: number
        height: number
    }>
    translations: Array<{
        languageId: string
        title: string | null
        altText: string | null
        caption: string | null
    }>
}

export type ArticleDetail = Omit<ArticleListItem, 'translations'> & {
    translations: BlogTranslation[]
    media: Array<{
        mediaId: string
        displayOrder: number
        media: ArticleGalleryImage
    }>
}

export type ArticleListResult = {
    items: ArticleListItem[]
    total: number
    page: number
    pageSize: number
}

export type ArticleFormValues = {
    status: ArticleStatus
    categoryIds: string[]
    primaryCategoryId: string | null
    tagIds: string[]
    translations: Array<{
        languageId: string
        title: string
        summary: string
        content: BlockEditorContent
        seoTitle: string
        seoDescription: string
        status: TranslationStatus
    }>
}

export type BlogTaxonomyTranslation = {
    languageId: string
    title: string
    slug: string
    description?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
}

export type BlogTaxonomy = {
    id: string
    isActive: boolean
    displayOrder: number
    translations: BlogTaxonomyTranslation[]
    _count: { articles: number }
}

export type BlogTaxonomyFormValues = {
    isActive: boolean
    translations: Array<{
        languageId: string
        title: string
        description?: string
        seoTitle?: string
        seoDescription?: string
    }>
}

export type ArticleListFilters = {
    search: string
    status: ArticleStatus | ''
    categoryId: string
    tagId: string
    page: number
    pageSize: number
}
