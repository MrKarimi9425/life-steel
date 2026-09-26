import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import Button from '@/components/ui/Button'
import ListPageLayout from '@/components/shared/ListPageLayout'
import ListFilters from '@/components/shared/ListFilters'
import ListSearchInput from '@/components/shared/ListSearchInput'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { useBlogLanguages } from '../hooks/useBlogLanguages'
import { useBlogTaxonomyPage } from '../hooks/useBlogTaxonomyPage'
import BlogTaxonomyTable from './BlogTaxonomyTable'
import BlogTaxonomyFormDialog from './BlogTaxonomyFormDialog'
import BlogTaxonomyConfirmDialog from './BlogTaxonomyConfirmDialog'
import type { BlogTaxonomy, BlogTaxonomyKind } from '../blog.types'

export default function BlogTaxonomyPageContent({
    kind,
}: {
    kind: BlogTaxonomyKind
}) {
    const page = useBlogTaxonomyPage(kind)
    const { query: languages, persianId } = useBlogLanguages()
    const title = (item: BlogTaxonomy) =>
        item.translations.find((entry) => entry.languageId === persianId)
            ?.title ??
        item.translations[0]?.title ??
        'بدون عنوان'
    const failed = [page.query, languages].find((query) => query.isError)
    const label = kind === 'categories' ? 'دسته بندی' : 'برچسب'
    return (
        <>
            <ListPageLayout
                title={
                    kind === 'categories'
                        ? 'دسته بندی های وبلاگ'
                        : 'برچسب های وبلاگ'
                }
                subtitle="مدیریت عنوان و ترجمه ها"
                actions={
                    <Button
                        icon={<AddIcon width={20} height={20} />}
                        variant="solid"
                        onClick={() => page.setEditing('new')}
                    >
                        {label} جدید
                    </Button>
                }
                filters={
                    <ListFilters>
                        <ListSearchInput
                            placeholder="جستجوی عنوان"
                            onSearch={page.setSearch}
                        />
                    </ListFilters>
                }
            >
                {failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت اطلاعات با خطا مواجه شد."
                        onRetry={() => void failed.refetch()}
                    />
                ) : (
                    <BlogTaxonomyTable
                        items={page.items}
                        loading={page.query.isPending}
                        total={page.total}
                        page={page.page}
                        pageSize={page.pageSize}
                        title={title}
                        onEdit={page.setEditing}
                        onDelete={page.setDeleting}
                        onPage={page.setPage}
                        onPageSize={page.changePageSize}
                        onReorder={(items) => page.reorder.mutate(items)}
                        pending={page.reorder.isPending}
                    />
                )}
            </ListPageLayout>
            {page.editing && (
                <BlogTaxonomyFormDialog
                    kind={kind}
                    item={page.editing === 'new' ? null : page.editing}
                    onClose={() => page.setEditing(null)}
                    onSaved={() => void page.refresh()}
                />
            )}
            {page.deleting && (
                <BlogTaxonomyConfirmDialog
                    title={title(page.deleting)}
                    pending={page.remove.isPending}
                    onClose={() => page.setDeleting(null)}
                    onConfirm={() => {
                        if (page.deleting) page.remove.mutate(page.deleting.id)
                    }}
                />
            )}
        </>
    )
}
