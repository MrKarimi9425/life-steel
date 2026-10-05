import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { LanguageTabs, ScopedMediaPicker } from '@/features/catalog'
import { useContentLanguages } from '@/features/blog'
import type { MediaAsset } from '@/features/media'
import { apiClient } from '@/lib/http/api-client'
import { siteContentApi, siteKeys } from '../site-content.api'
import type {
    BannerTranslation,
    BannerViewport,
    HomeSectionType,
    SiteSectionPage,
    SiteBanner,
} from '../site-content.types'
import SiteDeleteDialog from './SiteDeleteDialog'

const viewportTitles: Record<BannerViewport, string> = {
    desktop: 'دسکتاپ',
    tablet: 'تبلت',
    mobile: 'موبایل',
}
const imageGuides: Record<
    Extract<HomeSectionType, 'HERO' | 'BANNER_FULL' | 'BANNER_SPLIT'>,
    Record<BannerViewport, string>
> = {
    HERO: {
        desktop: 'پیشنهاد: ۱۹۲۰ در ۵۶۰ پیکسل',
        tablet: 'پیشنهاد: ۱۲۰۰ در ۶۰۰ پیکسل',
        mobile: 'پیشنهاد: ۷۵۰ در ۹۰۰ پیکسل',
    },
    BANNER_FULL: {
        desktop: 'پیشنهاد: ۱۴۴۰ در ۴۲۰ پیکسل',
        tablet: 'پیشنهاد: ۱۰۲۴ در ۴۲۰ پیکسل',
        mobile: 'پیشنهاد: ۷۵۰ در ۵۰۰ پیکسل',
    },
    BANNER_SPLIT: {
        desktop: 'پیشنهاد: ۷۰۰ در ۴۴۰ پیکسل',
        tablet: 'پیشنهاد: ۵۰۰ در ۴۰۰ پیکسل',
        mobile: 'پیشنهاد: ۷۵۰ در ۵۰۰ پیکسل',
    },
}
const pageImageGuides: Record<BannerViewport, string> = {
    desktop: 'پیشنهاد: ۱۴۴۰ در ۳۰۰ پیکسل',
    tablet: 'پیشنهاد: ۱۰۲۴ در ۳۲۰ پیکسل',
    mobile: 'پیشنهاد: ۷۵۰ در ۴۲۰ پیکسل',
}
const viewports: BannerViewport[] = ['desktop', 'tablet', 'mobile']
const imageField = (viewport: BannerViewport) =>
    `${viewport}Image` as keyof Pick<
        BannerTranslation,
        'desktopImage' | 'tabletImage' | 'mobileImage'
    >
const imageIdField = (viewport: BannerViewport) =>
    `${viewport}ImageId` as keyof Pick<
        BannerTranslation,
        'desktopImageId' | 'tabletImageId' | 'mobileImageId'
    >

export default function BannerImageDialog({
    bannerId,
    sectionType,
    sectionPage,
    onClose,
}: {
    bannerId: string
    sectionType: Extract<
        HomeSectionType,
        'HERO' | 'BANNER_FULL' | 'BANNER_SPLIT'
    >
    sectionPage: SiteSectionPage
    onClose: () => void
}) {
    const client = useQueryClient()
    const {
        query: languagesQuery,
        languages,
        persianId,
    } = useContentLanguages()
    const query = useQuery({
        queryKey: siteKeys.banners,
        queryFn: siteContentApi.banners,
    })
    const current = useRef(query.data)
    current.current = query.data
    const [activeLanguageId, setActiveLanguageId] = useState<string | null>(
        null,
    )
    const [busy, setBusy] = useState(false)
    const [deleting, setDeleting] = useState<BannerViewport | null>(null)
    const banner = query.data?.find((item) => item.id === bannerId)
    const languageId = activeLanguageId ?? persianId ?? languages[0]?.id ?? ''
    const translation = banner?.translations.find(
        (item) => item.languageId === languageId,
    )
    const updateBanner = (updated: SiteBanner) => {
        const next = current.current?.map((item) =>
            item.id === bannerId ? updated : item,
        )
        current.current = next
        client.setQueryData(siteKeys.banners, next)
    }
    const remove = useMutation({
        mutationFn: (viewport: BannerViewport) =>
            siteContentApi.removeBannerImage(bannerId, languageId, viewport),
        meta: { suppressGlobalSuccess: true },
        onSuccess: (result) => {
            if (result.removedFromStorage)
                toast.success('تصویر برای همیشه حذف شد.')
            else toast.warning('تصویر از بنر جدا شد، اما حذف فایل کامل نشد.')
            setDeleting(null)
            void client.invalidateQueries({ queryKey: siteKeys.banners })
        },
    })
    const uploaded =
        (viewport: BannerViewport) => async (asset: MediaAsset) => {
            try {
                const updated = await siteContentApi.saveBannerImage(
                    bannerId,
                    languageId,
                    viewport,
                    asset.id,
                )
                updateBanner(updated)
                if (!updated.removedPreviousImageFromStorage)
                    toast.warning(
                        'تصویر جدید ذخیره شد، اما حذف فایل قبلی کامل نشد.',
                    )
            } catch (error) {
                await apiClient
                    .delete(`media/${asset.id}`)
                    .catch(() => undefined)
                throw error
            }
        }
    const loading = query.isPending || languagesQuery.isPending
    const failed = query.isError
        ? query
        : languagesQuery.isError
          ? languagesQuery
          : null
    return (
        <FormDialog
            isOpen
            title="تصاویر واکنش گرای بنر"
            width={1040}
            isPending={busy || remove.isPending}
            onClose={onClose}
        >
            <FormDialogBody className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                    <p>
                        <strong className="ml-1">راهنمای بارگذاری:</strong>
                        هر سه نسخه برای نمایش این زبان الزامی هستند. تصویرها را
                        دقیقا با اندازه پیشنهادی و بدون نیاز به برش آماده کنید؛
                        کل تصویر داخل بنر نمایش داده می شود.
                    </p>
                </div>
                {loading ? (
                    <Loading loading />
                ) : failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت اطلاعات بنر ناموفق بود."
                        onRetry={() => void failed.refetch()}
                    />
                ) : banner ? (
                    <LanguageTabs
                        languages={languages}
                        activeId={languageId}
                        onChange={setActiveLanguageId}
                    >
                        {translation ? (
                            <div className="grid gap-4 lg:grid-cols-3">
                                {viewports.map((viewport) => {
                                    const asset = translation[
                                        imageField(viewport)
                                    ] as MediaAsset | null
                                    const assetId = translation[
                                        imageIdField(viewport)
                                    ] as string | null
                                    return (
                                        <section
                                            key={`${languageId}-${viewport}`}
                                            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-700"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                                    {viewportTitles[viewport]}
                                                </h3>
                                                <p className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {sectionPage !== 'HOME'
                                                        ? pageImageGuides[
                                                              viewport
                                                          ]
                                                        : imageGuides[
                                                              sectionType
                                                          ][viewport]}
                                                </p>
                                            </div>
                                            <ScopedMediaPicker
                                                assets={asset ? [asset] : []}
                                                selectedIds={
                                                    assetId ? [assetId] : []
                                                }
                                                onChange={() => undefined}
                                                multiple={false}
                                                allowVideos={false}
                                                cropImages={false}
                                                imageProfile="none"
                                                mediaLayout="single"
                                                mediaPreviewClassName="h-24"
                                                onRemove={() =>
                                                    setDeleting(viewport)
                                                }
                                                onBusyChange={setBusy}
                                                onUploaded={uploaded(viewport)}
                                                onAssetUpdated={() =>
                                                    void client.invalidateQueries(
                                                        {
                                                            queryKey:
                                                                siteKeys.banners,
                                                        },
                                                    )
                                                }
                                                showMediaTitle={false}
                                            />
                                        </section>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                                ابتدا متن جایگزین و لینک این زبان را در فرم بنر
                                ذخیره کنید.
                            </p>
                        )}
                    </LanguageTabs>
                ) : (
                    <p className="text-sm text-red-600">بنر پیدا نشد.</p>
                )}
            </FormDialogBody>
            <FormDialogActions>
                <Button disabled={busy || remove.isPending} onClick={onClose}>
                    بستن
                </Button>
            </FormDialogActions>
            {deleting && (
                <SiteDeleteDialog
                    title={`تصویر ${viewportTitles[deleting]}`}
                    pending={remove.isPending}
                    onClose={() => {
                        if (!remove.isPending) setDeleting(null)
                    }}
                    onConfirm={() => {
                        if (!remove.isPending) remove.mutate(deleting)
                    }}
                />
            )}
        </FormDialog>
    )
}
