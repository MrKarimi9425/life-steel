import { apiClient } from '@/lib/http/api-client'
import createSlug from '@/utils/createSlug'
import type { ApiResponse } from '@/lib/http/api.types'
import type {
    AttributeValueForm,
    ProductBaseForm,
    ProductDetail,
    ProductListResult,
    ProductPricing,
    ProductPricingForm,
} from './products.types'

export const productsApi = {
    async pricing(id: string) {
        const response = await apiClient.get<ApiResponse<ProductPricing>>(`catalog/products/${id}/pricing`)
        if (!response.data.data) throw new Error('قیمت گذاری محصول دریافت نشد.')
        return response.data.data
    },
    savePricing(id: string, form: ProductPricingForm) {
        return apiClient.put(`catalog/products/${id}/pricing`, {
            showPrice: form.showPrice,
            basePrice: form.basePrice || null,
            colors: form.colors.map((color) => ({ ...color, amount: color.amount || null })),
        })
    },
    async list(params: URLSearchParams) {
        const response = await apiClient.get<ApiResponse<ProductListResult>>(
            `catalog/products?${params}`,
        )
        return response.data.data ?? { items: [], total: 0, pageSize: 20 }
    },
    async detail(id: string) {
        const response = await apiClient.get<ApiResponse<ProductDetail>>(
            `catalog/products/${id}`,
        )
        if (!response.data.data) throw new Error('محصول پیدا نشد.')
        return response.data.data
    },
    create(form: ProductBaseForm) {
        return apiClient.post('catalog/products', {
            ...form,
            sku: form.sku || undefined,
            coverMediaId: undefined,
            mediaIds: [],
            relatedProductIds: [],
            attributeValues: [],
            translations: form.translations.map((item) => ({
                ...item,
                title: item.title?.trim() || undefined,
                slug: createSlug(item.title ?? '') || undefined,
            })),
        })
    },
    updateBase(id: string, form: ProductBaseForm) {
        return apiClient.patch(`catalog/products/${id}`, {
            ...form,
            sku: form.sku || undefined,
            translations: form.translations.map((item) => ({
                ...item,
                title: item.title?.trim() || undefined,
                slug: createSlug(item.title ?? '') || undefined,
            })),
        })
    },
    updateAttributes(id: string, attributeValues: AttributeValueForm[]) {
        return apiClient.patch(`catalog/products/${id}`, {
            attributeValues: attributeValues.map((value) => ({
                ...value,
                numberValue: Number.isFinite(value.numberValue)
                    ? value.numberValue
                    : undefined,
                customDefinition: value.customDefinition
                    ? {
                          ...value.customDefinition,
                          translations:
                              value.customDefinition.translations.filter(
                                  (item) => item.name.trim(),
                              ),
                      }
                    : undefined,
            })),
        })
    },
    updateMedia(id: string, mediaIds: string[], coverMediaId: string) {
        return apiClient.patch(`catalog/products/${id}`, {
            mediaIds,
            coverMediaId: coverMediaId || null,
        })
    },
    deleteMedia(productId: string, mediaId: string) {
        return apiClient.delete<ApiResponse<{
            removedFromStorage: boolean
            coverMediaId: string | null
        }>>(`catalog/products/${productId}/media/${mediaId}`)
    },
    reorder(ids: string[]) {
        return apiClient.put('catalog/products/order', { ids })
    },
    archive(id: string) {
        return apiClient.post(`catalog/products/${id}/archive`)
    },
    remove(id: string) {
        return apiClient.delete(`catalog/products/${id}`)
    },
}
