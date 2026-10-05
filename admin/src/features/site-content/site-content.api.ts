import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type {
    ContactInformation,
    ContactMessage,
    ContactValues,
    MessageFilters,
    MessageResult,
    MessageStatus,
    PageValues,
    SiteLocation,
    SitePage,
    SiteBanner,
    BannerValues,
    BannerViewport,
    HomePageSettings,
    HomePageSettingsValues,
    HomeSection,
    HomeSectionValues,
} from './site-content.types'
const base = 'site-content'
async function get<T>(path: string): Promise<T> {
    const result = (await apiClient.get<ApiResponse<T>>(`${base}/${path}`)).data
        .data
    if (result === undefined) throw new Error('پاسخ سرور معتبر نیست.')
    return result as T
}
export const siteKeys = {
    about: ['site-content', 'about'],
    banners: ['site-content', 'banners'],
    contacts: ['site-content', 'contacts'],
    location: ['site-content', 'location'],
    messages: ['site-content', 'messages'],
    settings: ['site-content', 'settings'],
    sections: ['site-content', 'home-sections'],
}
export const siteContentApi = {
    settings: () => get<HomePageSettings>('settings'),
    saveSettings: (values: HomePageSettingsValues) =>
        apiClient.put(`${base}/settings`, values),
    sections: () => get<HomeSection[]>('home-sections'),
    saveSection: (id: string | null, values: HomeSectionValues) =>
        id
            ? apiClient.put(`${base}/home-sections/${id}`, values)
            : apiClient.post(`${base}/home-sections`, values),
    setSectionStatus: (id: string, isActive: boolean) =>
        apiClient.patch(`${base}/home-sections/${id}/status`, { isActive }),
    reorderSections: (ids: string[]) =>
        apiClient.put(`${base}/home-sections/order`, { ids }),
    removeSection: async (id: string) =>
        (
            await apiClient.delete<
                ApiResponse<{ removedFromStorage: boolean }>
            >(`${base}/home-sections/${id}`)
        ).data.data!,
    banners: () => get<SiteBanner[]>('banners'),
    saveBanner: (id: string | null, values: BannerValues) => {
        const payload = {
            ...values,
            translations: values.translations.filter(
                (item) => item.altText.trim() || item.targetUrl.trim(),
            ),
        }
        return id
            ? apiClient.put(`${base}/banners/${id}`, payload)
            : apiClient.post(`${base}/banners`, payload)
    },
    reorderBanners: (ids: string[]) =>
        apiClient.put(`${base}/banners/order`, { ids }),
    saveBannerImage: async (
        id: string,
        languageId: string,
        viewport: BannerViewport,
        mediaId: string,
    ) =>
        (
            await apiClient.put<
                ApiResponse<
                    SiteBanner & { removedPreviousImageFromStorage: boolean }
                >
            >(`${base}/banners/${id}/image`, {
                languageId,
                viewport,
                mediaId,
            })
        ).data.data!,
    removeBannerImage: async (
        id: string,
        languageId: string,
        viewport: BannerViewport,
    ) =>
        (
            await apiClient.delete<
                ApiResponse<{ removedFromStorage: boolean }>
            >(`${base}/banners/${id}/image`, {
                params: { languageId, viewport },
            })
        ).data.data!,
    removeBanner: async (id: string) =>
        (
            await apiClient.delete<
                ApiResponse<{ removedFromStorage: boolean }>
            >(`${base}/banners/${id}`)
        ).data.data!,
    about: () => get<SitePage>('about'),
    saveAbout: (values: PageValues) =>
        apiClient.put(`${base}/about`, {
            ...values,
            translations: values.translations
                .filter((t) => t.title.trim())
                .map((t) => ({
                    ...t,
                    seoTitle: t.seoTitle || undefined,
                    seoDescription: t.seoDescription || undefined,
                })),
        }),
    async gallery(mediaIds: string[]) {
        return (
            await apiClient.put<ApiResponse<SitePage>>(
                `${base}/about/gallery`,
                { mediaIds },
            )
        ).data.data!
    },
    removeImage: async (id: string) =>
        (
            await apiClient.delete<
                ApiResponse<{ removedFromStorage: boolean }>
            >(`${base}/about/gallery/${id}`)
        ).data.data!,
    contacts: () => get<ContactInformation[]>('contacts'),
    saveContact: (id: string | null, values: ContactValues) => {
        const payload = {
            ...values,
            translations: values.translations.filter(
                (t) => t.title.trim() || t.value.trim(),
            ),
        }
        return id
            ? apiClient.put(`${base}/contacts/${id}`, payload)
            : apiClient.post(`${base}/contacts`, payload)
    },
    removeContact: (id: string) => apiClient.delete(`${base}/contacts/${id}`),
    reorder: (ids: string[]) =>
        apiClient.put(`${base}/contacts/order`, { ids }),
    location: () => get<SiteLocation | null>('location'),
    saveLocation: (values: SiteLocation) =>
        apiClient.put(`${base}/location`, values),
    messages: (filters: MessageFilters) =>
        get<MessageResult>(
            `messages?${new URLSearchParams({ ...(filters.search ? { search: filters.search } : {}), ...(filters.status ? { status: filters.status } : {}), page: String(filters.page), pageSize: String(filters.pageSize) })}`,
        ),
    message: (id: string) => get<ContactMessage>(`messages/${id}`),
    status: (id: string, status: MessageStatus) =>
        apiClient.patch(`${base}/messages/${id}`, { status }),
    removeMessage: (id: string) => apiClient.delete(`${base}/messages/${id}`),
}
