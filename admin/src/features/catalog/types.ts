import type { BlockEditorContent } from '@/components/shared/BlockEditor'

export type Translation = {
    languageId: string
    title: string
    slug: string
    summary?: string
    description?: string
    content?: BlockEditorContent | null
    seoTitle?: string
    seoDescription?: string
    status?: 'DRAFT' | 'PUBLISHED'
}

export type Category = {
    id: string
    isActive: boolean
    displayOrder: number
    imageId: string | null
    translations: Translation[]
}

export type AttributeDefinition = {
    id: string
    type: string
    isFilterable: boolean
    isVisible: boolean
    isActive: boolean
    allowCustomValue: boolean
    displayOrder: number
    translations: Array<{ languageId: string; name: string; description?: string; unitLabel?: string }>
    categories: Array<{ categoryId: string; isRequired: boolean; displayOrder: number }>
    options: Array<{
        id: string
        colorHex: string | null
        isActive: boolean
        displayOrder: number
        translations: Array<{ languageId: string; label: string }>
    }>
}
