import { useQuery, useQueryClient } from '@tanstack/react-query'
import ListPageLayout, {
    ListPageContent,
} from '@/components/shared/ListPageLayout'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import HomePageSettingsForm from '../components/HomePageSettingsForm'
import { siteContentApi, siteKeys } from '../site-content.api'

export function HomePageSettingsPage() {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.settings,
        queryFn: siteContentApi.settings,
    })

    return (
        <ListPageLayout
            title="تنظیمات صفحه اصلی"
            subtitle="کنترل تعداد محتوای بخش های صفحه اصلی سایت"
        >
            {query.isError ? (
                <QueryErrorState
                    error={query.error}
                    title="دریافت تنظیمات صفحه اصلی ناموفق بود."
                    onRetry={() => void query.refetch()}
                />
            ) : query.isPending || !query.data ? (
                <Loading loading />
            ) : (
                <ListPageContent>
                    <HomePageSettingsForm
                        settings={query.data}
                        onSaved={() =>
                            void client.invalidateQueries({
                                queryKey: siteKeys.settings,
                            })
                        }
                    />
                </ListPageContent>
            )}
        </ListPageLayout>
    )
}
