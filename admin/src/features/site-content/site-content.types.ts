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
export type SiteLocation = { latitude: number | null; longitude: number | null }
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
