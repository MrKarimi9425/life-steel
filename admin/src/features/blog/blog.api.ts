import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type {
    ArticleDetail,
    ArticleFormValues,
    ArticleListFilters,
    ArticleListResult,
    BlogTaxonomy,
    BlogTaxonomyFormValues,
    BlogTaxonomyKind,
} from './blog.types'

function requireData<T>(response: ApiResponse<T>): T {
    if (response.data === null || response.data === undefined) {
        throw new Error('پاسخ وبلاگ معتبر نیست.')
    }
    return response.data
}

function articlePayload(form: ArticleFormValues) {
    return {
        status: form.status,
        categoryIds: form.categoryIds,
        primaryCategoryId: form.primaryCategoryId,
        tagIds: form.tagIds,
        translations: form.translations.map((translation) => ({
            languageId: translation.languageId,
            title: translation.title.trim() || undefined,
            summary: translation.summary.trim() || undefined,
            content: translation.content,
            seoTitle: translation.seoTitle.trim() || undefined,
            seoDescription: translation.seoDescription.trim() || undefined,
            status: translation.status,
        })),
    }
}

function taxonomyPayload(kind: BlogTaxonomyKind, form: BlogTaxonomyFormValues) {
    return {
        isActive: form.isActive,
        translations: form.translations
            .filter((translation) => translation.title.trim())
            .map((translation) => ({
                languageId: translation.languageId,
                title: translation.title.trim(),
                ...(kind === 'categories'
                    ? {
                          description:
                              translation.description?.trim() || undefined,
                          seoTitle: translation.seoTitle?.trim() || undefined,
                          seoDescription:
                              translation.seoDescription?.trim() || undefined,
                      }
                    : {}),
            })),
    }
}

export const blogApi = {
    async articles(filters: ArticleListFilters) {
        const params = new URLSearchParams({
            page: String(filters.page),
            pageSize: String(filters.pageSize),
        })
        for (const key of [
            'search',
            'status',
            'categoryId',
            'tagId',
        ] as const) {
            if (filters[key]) params.set(key, filters[key])
        }
        const response = await apiClient.get<ApiResponse<ArticleListResult>>(
            `blog/articles?${params}`,
        )
        return requireData(response.data)
    },
    async article(id: string) {
        const response = await apiClient.get<ApiResponse<ArticleDetail>>(
            `blog/articles/${id}`,
        )
        return requireData(response.data)
    },
    async saveArticle(id: string | null, form: ArticleFormValues) {
        const payload = articlePayload(form)
        const response = id
            ? await apiClient.patch<ApiResponse<ArticleDetail>>(
                  `blog/articles/${id}`,
                  payload,
              )
            : await apiClient.post<ApiResponse<ArticleDetail>>(
                  'blog/articles',
                  payload,
              )
        return requireData(response.data)
    },
    async saveGallery(
        id: string,
        mediaIds: string[],
        coverMediaId: string | null,
    ) {
        const response = await apiClient.put<ApiResponse<ArticleDetail>>(
            `blog/articles/${id}/gallery`,
            { mediaIds, coverMediaId },
        )
        return requireData(response.data)
    },
    async deleteImage(id: string, mediaId: string) {
        const response = await apiClient.delete<
            ApiResponse<{
                removedFromStorage: boolean
                coverMediaId: string | null
            }>
        >(`blog/articles/${id}/gallery/${mediaId}`)
        return requireData(response.data)
    },
    archiveArticle(id: string) {
        return apiClient.post(`blog/articles/${id}/archive`)
    },
    async deleteArticle(id: string) {
        const response = await apiClient.delete<
            ApiResponse<{ cleanupComplete: boolean }>
        >(`blog/articles/${id}`)
        return requireData(response.data)
    },
    reorder(kind: 'articles' | BlogTaxonomyKind, ids: string[]) {
        return apiClient.put(`blog/${kind}/order`, { ids })
    },
    async taxonomy(kind: BlogTaxonomyKind) {
        const response = await apiClient.get<ApiResponse<BlogTaxonomy[]>>(
            `blog/${kind}`,
        )
        return requireData(response.data)
    },
    saveTaxonomy(
        kind: BlogTaxonomyKind,
        id: string | null,
        form: BlogTaxonomyFormValues,
    ) {
        const payload = taxonomyPayload(kind, form)
        return id
            ? apiClient.patch(`blog/${kind}/${id}`, payload)
            : apiClient.post(`blog/${kind}`, payload)
    },
    deleteTaxonomy(kind: BlogTaxonomyKind, id: string) {
        return apiClient.delete(`blog/${kind}/${id}`)
    },
}
