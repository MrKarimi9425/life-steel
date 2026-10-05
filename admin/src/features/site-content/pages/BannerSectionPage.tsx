import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import BackIcon from '@/assets/icons/iconsax/linear/arrow-right-02.svg?react'
import Button from '@/components/ui/Button'
import ListPageLayout from '@/components/shared/ListPageLayout'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { useContentLanguages } from '@/features/blog'
import { siteContentApi, siteKeys } from '../site-content.api'
import {
    homeSectionLabels,
    siteSectionPageLabels,
    type HomeSection,
    type HomeSectionType,
    type SiteBanner,
} from '../site-content.types'
import BannersTable from '../components/BannersTable'
import BannerFormDialog from '../components/BannerFormDialog'
import BannerImageDialog from '../components/BannerImageDialog'
import SiteDeleteDialog from '../components/SiteDeleteDialog'

type BannerSectionType = Extract<
    HomeSectionType,
    'HERO' | 'BANNER_FULL' | 'BANNER_SPLIT'
>
type BannerSection = HomeSection & { type: BannerSectionType }

const isBannerSection = (section: HomeSection): section is BannerSection =>
    ['HERO', 'BANNER_FULL', 'BANNER_SPLIT'].includes(section.type)

const bannerCapacity = (section: HomeSection) =>
    section.type === 'BANNER_FULL'
        ? 1
        : section.type === 'BANNER_SPLIT'
          ? 2
          : Number.POSITIVE_INFINITY

export function BannerSectionPage() {
    const { sectionId = '' } = useParams()
    const navigate = useNavigate()
    const client = useQueryClient()
    const { persianId, query: languages } = useContentLanguages()
    const query = useQuery({
        queryKey: siteKeys.sections,
        queryFn: siteContentApi.sections,
    })
    const [bannerForm, setBannerForm] = useState<SiteBanner | 'new' | null>(
        null,
    )
    const [imaging, setImaging] = useState<SiteBanner | null>(null)
    const [deletingBanner, setDeletingBanner] = useState<SiteBanner | null>(
        null,
    )
    const section = query.data
        ?.filter(isBannerSection)
        .find((item) => item.id === sectionId)
    const refresh = () =>
        client.invalidateQueries({ queryKey: siteKeys.sections })
    const reorder = useMutation({
        mutationFn: (rows: SiteBanner[]) =>
            siteContentApi.reorderBanners(rows.map((row) => row.id)),
        onMutate: async (rows) => {
            await client.cancelQueries({ queryKey: siteKeys.sections })
            const previous = client.getQueryData<HomeSection[]>(
                siteKeys.sections,
            )
            client.setQueryData<HomeSection[]>(
                siteKeys.sections,
                previous?.map((item) =>
                    item.id === sectionId ? { ...item, banners: rows } : item,
                ),
            )
            return { previous }
        },
        onError: (_error, _rows, context) =>
            client.setQueryData(siteKeys.sections, context?.previous),
        onSettled: () => void refresh(),
    })
    const removeBanner = useMutation({
        mutationFn: (banner: SiteBanner) =>
            siteContentApi.removeBanner(banner.id),
        meta: { suppressGlobalSuccess: true },
        onSuccess: (result) => {
            if (result.removedFromStorage)
                toast.success('بنر و تصاویر آن برای همیشه حذف شدند.')
            else toast.warning('بنر حذف شد، اما حذف همه فایل ها کامل نشد.')
            setDeletingBanner(null)
            void refresh()
        },
    })
    const failed = [query, languages].find((item) => item.isError)
    const capacityFull = section
        ? section.banners.length >= bannerCapacity(section)
        : true
    const title =
        section?.title ??
        (section ? homeSectionLabels[section.type] : 'مدیریت بنرها')

    return (
        <>
            <ListPageLayout
                title={title}
                subtitle={
                    section
                        ? `${section.page === 'HOME' ? homeSectionLabels[section.type] : siteSectionPageLabels[section.page]}، ${section.banners.length} بنر ثبت شده`
                        : 'بنرهای سایت'
                }
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            icon={<BackIcon width={18} height={18} />}
                            onClick={() => navigate('/site/banners')}
                        >
                            بازگشت
                        </Button>
                        {section && (
                            <Button
                                disabled={capacityFull}
                                icon={<AddIcon width={18} height={18} />}
                                variant="solid"
                                onClick={() => setBannerForm('new')}
                            >
                                بنر جدید
                            </Button>
                        )}
                    </div>
                }
            >
                {query.isPending || languages.isPending ? (
                    <Loading loading />
                ) : failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت بنرهای این بخش ناموفق بود."
                        onRetry={() => void failed.refetch()}
                    />
                ) : !section ? (
                    <div className="rounded-2xl border border-gray-200 p-6 text-center dark:border-gray-700">
                        <p className="text-sm text-gray-500">
                            بخش بنر پیدا نشد یا دیگر در دسترس نیست.
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => navigate('/site/banners')}
                        >
                            بازگشت به بخش های بنر
                        </Button>
                    </div>
                ) : (
                    <div className="flex min-h-full flex-col gap-4">
                        {capacityFull && section.type !== 'HERO' && (
                            <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800">
                                ظرفیت این چیدمان کامل است.
                            </p>
                        )}
                        <BannersTable
                            items={section.banners}
                            loading={false}
                            total={section.banners.length}
                            page={1}
                            pageSize={1000}
                            persianId={persianId}
                            pending={reorder.isPending}
                            onEdit={setBannerForm}
                            onImage={setImaging}
                            onDelete={setDeletingBanner}
                            onPage={() => undefined}
                            onPageSize={() => undefined}
                            onReorder={(rows) => reorder.mutate(rows)}
                        />
                    </div>
                )}
            </ListPageLayout>
            {bannerForm && section && (
                <BannerFormDialog
                    item={bannerForm === 'new' ? null : bannerForm}
                    sectionId={section.id}
                    onClose={() => setBannerForm(null)}
                    onSaved={() => void refresh()}
                />
            )}
            {imaging && section && (
                <BannerImageDialog
                    bannerId={imaging.id}
                    sectionType={section.type}
                    sectionPage={section.page}
                    onClose={() => {
                        setImaging(null)
                        void refresh()
                    }}
                />
            )}
            {deletingBanner && (
                <SiteDeleteDialog
                    title={
                        deletingBanner.translations.find(
                            (item) => item.languageId === persianId,
                        )?.altText ?? 'بنر'
                    }
                    pending={removeBanner.isPending}
                    onClose={() => {
                        if (!removeBanner.isPending) setDeletingBanner(null)
                    }}
                    onConfirm={() => {
                        if (!removeBanner.isPending)
                            removeBanner.mutate(deletingBanner)
                    }}
                />
            )}
        </>
    )
}
