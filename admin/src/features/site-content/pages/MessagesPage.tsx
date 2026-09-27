import ListPageLayout from '@/components/shared/ListPageLayout'
import ListFilters from '@/components/shared/ListFilters'
import ListSearchInput from '@/components/shared/ListSearchInput'
import Select from '@/components/ui/Select'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { useMessagesPage } from '../hooks/useMessagesPage'
import MessagesTable from '../components/MessagesTable'
import MessageDetailDialog from '../components/MessageDetailDialog'
import SiteDeleteDialog from '../components/SiteDeleteDialog'
import { messageStatuses } from '../site-content.types'
export function MessagesPage() {
    const p = useMessagesPage()
    const options = [{ value: '', label: 'همه وضعیت ها' }, ...messageStatuses]
    return (
        <>
            <ListPageLayout
                title="پیام های تماس"
                subtitle="مشاهده و پیگیری پیام های ارسال شده از سایت"
                filters={
                    <ListFilters>
                        <ListSearchInput
                            placeholder="نام، تلفن یا موضوع"
                            onSearch={(search) =>
                                p.setFilters((f) => ({ ...f, search, page: 1 }))
                            }
                        />
                        <Select
                            className="min-w-48"
                            options={options}
                            value={options.find(
                                (o) => o.value === p.filters.status,
                            )}
                            onChange={(o) =>
                                p.setFilters((f) => ({
                                    ...f,
                                    status: o?.value ?? '',
                                    page: 1,
                                }))
                            }
                        />
                    </ListFilters>
                }
            >
                {p.query.isError ? (
                    <QueryErrorState
                        error={p.query.error}
                        title="دریافت پیام ها ناموفق بود."
                        onRetry={() => void p.query.refetch()}
                    />
                ) : (
                    <MessagesTable
                        items={p.query.data?.items ?? []}
                        loading={p.query.isPending}
                        total={p.query.data?.total ?? 0}
                        page={p.filters.page}
                        pageSize={p.filters.pageSize}
                        onPage={(page) => p.setFilters((f) => ({ ...f, page }))}
                        onPageSize={(pageSize) =>
                            p.setFilters((f) => ({ ...f, pageSize, page: 1 }))
                        }
                        onOpen={p.setOpened}
                        onDelete={p.setDeleting}
                    />
                )}
            </ListPageLayout>
            {p.opened && (
                <MessageDetailDialog
                    id={p.opened.id}
                    onClose={() => p.setOpened(null)}
                />
            )}
            {p.deleting && (
                <SiteDeleteDialog
                    title={p.deleting.subject}
                    pending={p.remove.isPending}
                    onClose={() => {
                        if (!p.remove.isPending) p.setDeleting(null)
                    }}
                    onConfirm={() => {
                        if (p.deleting && !p.remove.isPending)
                            p.remove.mutate(p.deleting.id)
                    }}
                />
            )}
        </>
    )
}
