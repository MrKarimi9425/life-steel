import type { BlockEditorContent } from '@/components/shared/BlockEditor'
import type { MediaAsset } from '@/features/media'
export type ContactType = 'PHONE' | 'EMAIL' | 'ADDRESS' | 'HOURS' | 'LINK'
export const contactTypes: { value: ContactType; label: string }[] = [
    { value: 'PHONE', label: 'تلفن' },
    { value: 'EMAIL', label: 'ایمیل' },
    { value: 'ADDRESS', label: 'نشانی' },
    { value: 'HOURS', label: 'ساعت کاری' },
    { value: 'LINK', label: 'لینک و شبکه اجتماعی' },
]
export type ContactTranslation = {
    languageId: string
    title: string
    value: string
}
export type ContactInformation = {
    id: string
    type: ContactType
    isActive: boolean
    displayOrder: number
    translations: ContactTranslation[]
}
export type ContactValues = Omit<ContactInformation, 'id' | 'displayOrder'>
export type PageTranslation = {
    languageId: string
    title: string
    content: BlockEditorContent
    seoTitle: string | null
    seoDescription: string | null
}
export type SitePage = {
    id: string
    isPublished: boolean
    translations: PageTranslation[]
    media: { mediaId: string; displayOrder: number; media: MediaAsset }[]
}
export type PageValues = Pick<SitePage, 'isPublished' | 'translations'>
export type BannerTranslation = {
    languageId: string
    altText: string
    targetUrl: string
    desktopImageId: string | null
    tabletImageId: string | null
    mobileImageId: string | null
    desktopImage: MediaAsset | null
    tabletImage: MediaAsset | null
    mobileImage: MediaAsset | null
}
export type BannerViewport = 'desktop' | 'tablet' | 'mobile'
export type SiteBanner = {
    id: string
    sectionId: string
    isPublished: boolean
    displayOrder: number
    translations: BannerTranslation[]
}
export type BannerValues = {
    sectionId: string
    isPublished: boolean
    translations: Pick<
        BannerTranslation,
        'languageId' | 'altText' | 'targetUrl'
    >[]
}
export type HomeSectionType =
    | 'HERO'
    | 'CATEGORIES'
    | 'FEATURED_PRODUCT'
    | 'SELECTED_PRODUCTS'
    | 'BENEFITS'
    | 'BLOG'
    | 'CONTACT'
    | 'BANNER_FULL'
    | 'BANNER_SPLIT'
export type SiteSectionPage = 'HOME' | 'PRODUCTS' | 'BLOG'
export type HomeSection = {
    id: string
    page: SiteSectionPage
    type: HomeSectionType
    title: string | null
    isActive: boolean
    displayOrder: number
    banners: SiteBanner[]
}
export type HomeSectionValues = {
    type: Extract<HomeSectionType, 'BANNER_FULL' | 'BANNER_SPLIT'>
    title: string
}
export const homeSectionLabels: Record<HomeSectionType, string> = {
    HERO: 'اسلایدر اصلی',
    CATEGORIES: 'دسته بندی ها',
    FEATURED_PRODUCT: 'محصول پیشنهادی',
    SELECTED_PRODUCTS: 'محصولات منتخب',
    BENEFITS: 'مزیت ها',
    BLOG: 'مقالات',
    CONTACT: 'دعوت به تماس',
    BANNER_FULL: 'بنر تمام عرض',
    BANNER_SPLIT: 'دو بنر کنار هم',
}
export const siteSectionPageLabels: Record<SiteSectionPage, string> = {
    HOME: 'صفحه اصلی',
    PRODUCTS: 'صفحه محصولات',
    BLOG: 'صفحه وبلاگ',
}
export type SiteLocation = { latitude: number | null; longitude: number | null }
export type HomePageSettings = {
    id: string
    selectedProductsLimit: number
    updatedAt: string
}
export type HomePageSettingsValues = Pick<
    HomePageSettings,
    'selectedProductsLimit'
>
export type MessageStatus = 'NEW' | 'READ' | 'FOLLOWED_UP'
export const messageStatuses: { value: MessageStatus; label: string }[] = [
    { value: 'NEW', label: 'جدید' },
    { value: 'READ', label: 'خوانده شده' },
    { value: 'FOLLOWED_UP', label: 'پیگیری شده' },
]
export type ContactMessage = {
    id: string
    name: string
    phone: string
    subject: string
    status: MessageStatus
    createdAt: string
    email?: string | null
    message?: string
}
export type MessageFilters = {
    search: string
    status: string
    page: number
    pageSize: number
}
export type MessageResult = {
    items: ContactMessage[]
    total: number
    page: number
    pageSize: number
}
