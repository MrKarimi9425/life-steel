import { useQuery } from '@tanstack/react-query'
import ListPageLayout, {
    ListPageContent,
} from '@/components/shared/ListPageLayout'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import SummaryMetricCard from '@/components/shared/SummaryMetricCard'
import Button from '@/components/ui/Button'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'

type Summary = {
    products: number
    publishedProducts: number
    categories: number
    admins: number
}

const numberFormatter = new Intl.NumberFormat('fa-IR')

export function DashboardPage() {
    const summary = useQuery({
        queryKey: ['dashboard', 'summary'],
        queryFn: async () => {
            const response =
                await apiClient.get<ApiResponse<Summary>>('dashboard/summary')
            if (!response.data.data)
                throw new Error('اطلاعات داشبورد دریافت نشد.')
            return response.data.data
        },
    })
    return (
        <ListPageLayout
            title="داشبورد مدیریت"
            subtitle="وضعیت محصولات و محتوای لایف استیل را یکجا ببینید."
            actions={
                <Button
                    loading={summary.isFetching}
                    onClick={() => {
                        void summary.refetch()
                    }}
                >
                    به روزرسانی
                </Button>
            }
        >
            <ListPageContent>
                {summary.isPending ? (
                    <Loading className="min-h-72" loading />
                ) : summary.isError ? (
                    <QueryErrorState
                        error={summary.error}
                        title="دریافت اطلاعات داشبورد با خطا مواجه شد."
                        onRetry={() => void summary.refetch()}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <SummaryMetricCard
                                title="همه محصولات"
                                value={numberFormatter.format(
                                    summary.data.products,
                                )}
                                description="محصولات ثبت شده"
                            />
                            <SummaryMetricCard
                                title="محصولات منتشر شده"
                                value={numberFormatter.format(
                                    summary.data.publishedProducts,
                                )}
                                description="قابل نمایش در سایت"
                            />
                            <SummaryMetricCard
                                title="دسته بندی ها"
                                value={numberFormatter.format(
                                    summary.data.categories,
                                )}
                                description="دسته بندی محصولات"
                            />
                            <SummaryMetricCard
                                title="ادمین ها"
                                value={numberFormatter.format(
                                    summary.data.admins,
                                )}
                                description="حساب های مدیریت"
                            />
                    </div>
                )}
            </ListPageContent>
        </ListPageLayout>
    )
}
