import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi, siteKeys } from '../site-content.api'
import type { HomeSection } from '../site-content.types'
import HomeSectionsTable from '../components/HomeSectionsTable'

export function HomeLayoutPage() {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.sections,
        queryFn: siteContentApi.sections,
    })
    const refresh = () =>
        client.invalidateQueries({ queryKey: siteKeys.sections })
    const reorder = useMutation({
        mutationFn: (rows: HomeSection[]) =>
            siteContentApi.reorderSections(
                rows.filter((row) => row.type !== 'HERO').map((row) => row.id),
            ),
        onMutate: async (rows) => {
            await client.cancelQueries({ queryKey: siteKeys.sections })
            const previous = client.getQueryData<HomeSection[]>(
                siteKeys.sections,
            )
            const otherPages =
                previous?.filter((section) => section.page !== 'HOME') ?? []
            client.setQueryData<HomeSection[]>(siteKeys.sections, [
                ...rows.filter((section) => section.type === 'HERO'),
                ...rows.filter((section) => section.type !== 'HERO'),
                ...otherPages,
            ])
            return { previous }
        },
        onError: (_error, _rows, context) =>
            client.setQueryData(siteKeys.sections, context?.previous),
        onSettled: () => void refresh(),
    })
    const status = useMutation({
        mutationFn: (section: HomeSection) =>
            siteContentApi.setSectionStatus(section.id, !section.isActive),
        onSuccess: () => void refresh(),
    })

    return (
        <ListPageLayout
            title="چیدمان صفحه اصلی"
            subtitle="ترتیب و وضعیت نمایش بخش های صفحه اصلی"
        >
            {query.isError ? (
                <QueryErrorState
                    error={query.error}
                    title="دریافت چیدمان صفحه اصلی ناموفق بود."
                    onRetry={() => void query.refetch()}
                />
            ) : (
                <HomeSectionsTable
                    items={(query.data ?? []).filter(
                        (section) => section.page === 'HOME',
                    )}
                    loading={query.isPending}
                    pending={reorder.isPending || status.isPending}
                    onStatus={(section) => status.mutate(section)}
                    onReorder={(rows) => reorder.mutate(rows)}
                />
            )}
        </ListPageLayout>
    )
}
