import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { blogApi } from '../blog.api'
import { articleListOptions, blogKeys } from '../blog.queries'
import type {
    ArticleListFilters,
    ArticleListItem,
    ArticleListResult,
} from '../blog.types'

export function useArticlesPage() {
    const client = useQueryClient()
    const [filters, setFilters] = useState<ArticleListFilters>({
        search: '',
        status: '',
        categoryId: '',
        tagId: '',
        page: 1,
        pageSize: 20,
    })
    const [dialog, setDialog] = useState<{
        kind: 'form' | 'gallery'
        articleId: string | null
    } | null>(null)
    const articlesQuery = useQuery(articleListOptions(filters))
    const refresh = () => client.invalidateQueries({ queryKey: blogKeys.all })

    const archiveMutation = useMutation({
        mutationFn: blogApi.archiveArticle,
        onSuccess: refresh,
    })
    const deleteMutation = useMutation({
        mutationFn: blogApi.deleteArticle,
        meta: { suppressGlobalSuccess: true },
        onSuccess: async (data, id) => {
            if (data.cleanupComplete)
                toast.success('مقاله و تصاویر آن برای همیشه حذف شدند.')
            else
                toast.warning(
                    'مقاله حذف شد، اما پاکسازی برخی فایل ها کامل نشد.',
                )
            client.removeQueries({ queryKey: blogKeys.article(id) })
            await refresh()
        },
    })
    const reorderMutation = useMutation({
        mutationFn: (items: ArticleListItem[]) =>
            blogApi.reorder(
                'articles',
                items.map((item) => item.id),
            ),
        onMutate: async (items) => {
            const queryKey = blogKeys.list(filters)
            await client.cancelQueries({ queryKey })
            const previous = client.getQueryData<ArticleListResult>(queryKey)
            if (previous) {
                client.setQueryData<ArticleListResult>(queryKey, {
                    ...previous,
                    items,
                })
            }
            return { queryKey, previous }
        },
        onError: (_error, _items, context) => {
            if (context?.previous) {
                client.setQueryData(context.queryKey, context.previous)
            }
        },
        onSettled: () =>
            client.invalidateQueries({ queryKey: blogKeys.articles }),
    })

    const updateFilters = (patch: Partial<ArticleListFilters>) =>
        setFilters((current) => ({ ...current, ...patch, page: 1 }))

    return {
        filters,
        articlesQuery,
        dialog,
        openDialog: (kind: 'form' | 'gallery', articleId: string | null) =>
            setDialog({ kind, articleId }),
        closeDialog: () => setDialog(null),
        updateFilters,
        setPage: (page: number) =>
            setFilters((current) => ({ ...current, page })),
        refresh,
        refreshArticles: () =>
            client.invalidateQueries({ queryKey: blogKeys.articles }),
        archiveMutation,
        deleteMutation,
        reorderMutation,
    }
}
