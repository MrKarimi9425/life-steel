import Button from '@/components/ui/Button'
import ListPageLayout from '@/components/shared/ListPageLayout'
import ListFilters from '@/components/shared/ListFilters'
import ListSearchInput from '@/components/shared/ListSearchInput'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { useContentLanguages } from '@/features/blog'
import { useContactsPage } from '../hooks/useContactsPage'
import ContactsTable from '../components/ContactsTable'
import ContactFormDialog from '../components/ContactFormDialog'
import LocationDialog from '../components/LocationDialog'
import SiteDeleteDialog from '../components/SiteDeleteDialog'
export function ContactsPage() {
    const p = useContactsPage()
    const { persianId, query: languages } = useContentLanguages()
    const failed = [p.query, languages].find((q) => q.isError)
    return (
        <>
            <ListPageLayout
                title="راه های ارتباطی"
                subtitle="اطلاعات تماس و موقعیت سایت"
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={() => p.setLocationOpen(true)}>
                            موقعیت نقشه
                        </Button>
                        <Button
                            variant="solid"
                            onClick={() => p.setEditing('new')}
                        >
                            راه ارتباطی جدید
                        </Button>
                    </div>
                }
                filters={
                    <ListFilters>
                        <ListSearchInput
                            placeholder="جستجوی عنوان و مقدار"
                            onSearch={p.setSearch}
                        />
                    </ListFilters>
                }
            >
                {failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت اطلاعات ناموفق بود."
                        onRetry={() => void failed.refetch()}
                    />
                ) : (
                    <ContactsTable
                        items={p.items}
                        loading={p.query.isPending || languages.isPending}
                        total={p.total}
                        page={p.page}
                        pageSize={p.pageSize}
                        persianId={persianId}
                        pending={p.reorder.isPending}
                        onEdit={p.setEditing}
                        onDelete={p.setDeleting}
                        onPage={p.setPage}
                        onPageSize={p.changePageSize}
                        onReorder={(rows) => p.reorder.mutate(rows)}
                    />
                )}
            </ListPageLayout>
            {p.editing && (
                <ContactFormDialog
                    item={p.editing === 'new' ? null : p.editing}
                    onClose={() => p.setEditing(null)}
                    onSaved={() => void p.refresh()}
                />
            )}
            {p.locationOpen && (
                <LocationDialog onClose={() => p.setLocationOpen(false)} />
            )}
            {p.deleting && (
                <SiteDeleteDialog
                    title={
                        p.deleting.translations.find(
                            (t) => t.languageId === persianId,
                        )?.title ?? 'راه ارتباطی'
                    }
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
