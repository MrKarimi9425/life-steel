import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import Button from '@/components/ui/Button'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi, siteKeys } from '../site-content.api'
import type { HomeSection } from '../site-content.types'
import BannerSectionsTable from '../components/BannerSectionsTable'
import HomeSectionFormDialog from '../components/HomeSectionFormDialog'
import SiteDeleteDialog from '../components/SiteDeleteDialog'

const isBannerSection = (section: HomeSection) =>
    ['HERO', 'BANNER_FULL', 'BANNER_SPLIT'].includes(section.type)

export function BannersPage() {
    const client = useQueryClient()
    const navigate = useNavigate()
    const query = useQuery({
        queryKey: siteKeys.sections,
        queryFn: siteContentApi.sections,
    })
    const [sectionForm, setSectionForm] = useState<HomeSection | 'new' | null>(
        null,
    )
    const [deletingSection, setDeletingSection] = useState<HomeSection | null>(
        null,
    )
    const refresh = () =>
        client.invalidateQueries({ queryKey: siteKeys.sections })
    const removeSection = useMutation({
        mutationFn: (section: HomeSection) =>
            siteContentApi.removeSection(section.id),
        meta: { suppressGlobalSuccess: true },
        onSuccess: (result) => {
            if (result.removedFromStorage)
                toast.success('بخش و تصاویر بنرهای آن برای همیشه حذف شدند.')
            else toast.warning('بخش حذف شد، اما حذف همه فایل ها کامل نشد.')
            setDeletingSection(null)
            void refresh()
        },
    })

    return (
        <>
            <ListPageLayout
                title="بنرهای سایت"
                subtitle="مدیریت اسلایدر صفحه اصلی و بنرهای صفحات محصولات و وبلاگ"
                actions={
                    <Button
                        variant="solid"
                        icon={<AddIcon width={20} height={20} />}
                        onClick={() => setSectionForm('new')}
                    >
                        بخش بنر جدید
                    </Button>
                }
            >
                {query.isError ? (
                    <QueryErrorState
                        error={query.error}
                        title="دریافت بنرهای سایت ناموفق بود."
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <BannerSectionsTable
                        items={(query.data ?? []).filter(isBannerSection)}
                        loading={query.isPending}
                        onManage={(section) =>
                            navigate(`/site/banners/${section.id}`)
                        }
                        onEdit={setSectionForm}
                        onDelete={setDeletingSection}
                    />
                )}
            </ListPageLayout>
            {sectionForm && (
                <HomeSectionFormDialog
                    item={sectionForm === 'new' ? null : sectionForm}
                    onClose={() => setSectionForm(null)}
                    onSaved={() => void refresh()}
                />
            )}
            {deletingSection && (
                <SiteDeleteDialog
                    title={deletingSection.title ?? 'بخش بنر'}
                    pending={removeSection.isPending}
                    onClose={() => {
                        if (!removeSection.isPending) setDeletingSection(null)
                    }}
                    onConfirm={() => {
                        if (!removeSection.isPending)
                            removeSection.mutate(deletingSection)
                    }}
                />
            )}
        </>
    )
}
