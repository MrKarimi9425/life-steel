import type { AttributeDefinition, Translation } from '../types'
import type { MediaAsset } from '@/features/media'

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type ProductListItem = {
    id: string
    sku: string | null
    status: ProductStatus
    isFeatured: boolean
    translations: Translation[]
}

export type ProductAttributeValue = {
    attributeId: string
    numberValue: string | null
    booleanValue: boolean | null
    rawValue: Record<string, unknown> | null
    isCustom: boolean
    displayOrder: number
    translations: Array<{ languageId: string; textValue: string }>
    selectedOptions: Array<{ optionId: string }>
    attribute: AttributeDefinition
}

export type ProductDetail = ProductListItem & {
    coverMediaId: string | null
    displayOrder: number
    categories: Array<{ categoryId: string; isPrimary: boolean }>
    media: Array<{ mediaId: string; media: MediaAsset }>
    attributeValues: ProductAttributeValue[]
}

export type ProductBaseForm = {
    sku: string
    status: ProductStatus
    isFeatured: boolean
    categoryIds: string[]
    primaryCategoryId: string
    translations: Translation[]
}

export type AttributeValueForm = {
    attributeId?: string
    customDefinition?: {
        type: string
        translations: Array<{
            languageId: string
            name: string
            description: string
            unitLabel: string
        }>
    }
    numberValue?: number
    booleanValue?: boolean
    rawValue?: Record<string, unknown>
    optionIds: string[]
    displayOrder: number
    translations: Array<{ languageId: string; textValue: string }>
}

export type ProductListResult = {
    items: ProductListItem[]
    total: number
    page: number
    pageSize: number
}

export type ProductDialogKind = 'form' | 'attributes' | 'media' | 'pricing'

export type ProductPricing = {
    images: MediaAsset[]
    showPrice: boolean
    basePrice: string | null
    colors: Array<{ id: string; colorHex: string | null; amount: string | null; mediaIds: string[]; primaryMediaId: string | null; translations: Array<{ languageId: string; label: string }> }>
}
export type ProductPricingForm = {
    showPrice: boolean
    basePrice: string
    colors: Array<{ optionId: string; amount: string; mediaIds: string[]; primaryMediaId: string | null }>
}
