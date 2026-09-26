import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import Button from '@/components/ui/Button'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { blogTaxonomyOptions } from '../blog.queries'
import { useBlogLanguages } from '../hooks/useBlogLanguages'
import { useArticlesPage } from '../hooks/useArticlesPage'
import ArticleFilters from '../components/ArticleFilters'
import ArticleTable from '../components/ArticleTable'
import ArticleFormDialog from '../components/ArticleFormDialog'
import ArticleGalleryDialog from '../components/ArticleGalleryDialog'
import ArticleConfirmDialog from '../components/ArticleConfirmDialog'
import type { ArticleListItem, BlogTaxonomy } from '../blog.types'

export function ArticlesPage() {
    const page = useArticlesPage()
    const { query: languagesQuery, persianId } = useBlogLanguages()
    const categories = useQuery(blogTaxonomyOptions('categories'))
    const tags = useQuery(blogTaxonomyOptions('tags'))
    const [confirmation, setConfirmation] = useState<{
        kind: 'archive' | 'delete'
        id: string
    } | null>(null)
    const title = (item: ArticleListItem | BlogTaxonomy) =>
        item.translations.find(
            (translation) => translation.languageId === persianId,
        )?.title ??
        item.translations[0]?.title ??
        'بدون عنوان'
    const confirmingArticle = page.articlesQuery.data?.items.find(
        (item) => item.id === confirmation?.id,
    )
    const failed = [page.articlesQuery, languagesQuery, categories, tags].find(
        (query) => query.isError,
    )
    return (
        <>
            <ListPageLayout
                title="مقاله ها"
                subtitle="مدیریت مقاله ها، ترجمه ها و گالری اختصاصی"
                actions={
                    <Button
                        variant="solid"
                        icon={<AddIcon width={20} height={20} />}
                        onClick={() => page.openDialog('form', null)}
                    >
                        مقاله جدید
                    </Button>
                }
                filters={
                    <ArticleFilters
                        filters={page.filters}
                        categories={categories.data ?? []}
                        tags={tags.data ?? []}
                        taxonomyTitle={title}
                        onChange={page.updateFilters}
                    />
                }
            >
                {failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت اطلاعات وبلاگ با خطا مواجه شد."
                        onRetry={() => void failed.refetch()}
                    />
                ) : (
                    <ArticleTable
                        articles={page.articlesQuery.data?.items ?? []}
                        loading={page.articlesQuery.isPending}
                        total={page.articlesQuery.data?.total ?? 0}
                        page={page.filters.page}
                        pageSize={page.filters.pageSize}
                        articleTitle={title}
                        onAction={page.openDialog}
                        onArchive={(id) =>
                            setConfirmation({ kind: 'archive', id })
                        }
                        onDelete={(id) =>
                            setConfirmation({ kind: 'delete', id })
                        }
                        onPageChange={page.setPage}
                        onPageSizeChange={(pageSize) =>
                            page.updateFilters({ pageSize })
                        }
                        onReorder={(items) =>
                            page.reorderMutation.mutate(items)
                        }
                        reorderPending={page.reorderMutation.isPending}
                    />
                )}
            </ListPageLayout>
            {page.dialog?.kind === 'form' && (
                <ArticleFormDialog
                    articleId={page.dialog.articleId}
                    onClose={page.closeDialog}
                    onSaved={() => void page.refresh()}
                />
            )}
            {page.dialog?.kind === 'gallery' && page.dialog.articleId && (
                <ArticleGalleryDialog
                    articleId={page.dialog.articleId}
                    onClose={page.closeDialog}
                    onSaved={() => void page.refreshArticles()}
                />
            )}
            {confirmation && (
                <ArticleConfirmDialog
                    kind={confirmation.kind}
                    title={confirmingArticle ? title(confirmingArticle) : ''}
                    pending={
                        page.archiveMutation.isPending ||
                        page.deleteMutation.isPending
                    }
                    onClose={() => setConfirmation(null)}
                    onConfirm={() => {
                        const mutation =
                            confirmation.kind === 'archive'
                                ? page.archiveMutation
                                : page.deleteMutation
                        mutation.mutate(confirmation.id, {
                            onSuccess: () => setConfirmation(null),
                        })
                    }}
                />
            )}
        </>
    )
}
