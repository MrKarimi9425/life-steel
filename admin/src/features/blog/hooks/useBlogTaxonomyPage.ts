import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { blogApi } from '../blog.api'
import { blogKeys, blogTaxonomyOptions } from '../blog.queries'
import type { BlogTaxonomy, BlogTaxonomyKind } from '../blog.types'

export function useBlogTaxonomyPage(kind: BlogTaxonomyKind) {
    const client = useQueryClient()
    const query = useQuery(blogTaxonomyOptions(kind))
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [editing, setEditing] = useState<BlogTaxonomy | 'new' | null>(null)
    const [deleting, setDeleting] = useState<BlogTaxonomy | null>(null)
    const filtered = useMemo(
        () =>
            (query.data ?? []).filter((item) =>
                item.translations.some((translation) =>
                    translation.title
                        .toLocaleLowerCase()
                        .includes(search.toLocaleLowerCase()),
                ),
            ),
        [query.data, search],
    )
    const items = filtered.slice((page - 1) * pageSize, page * pageSize)
    const refresh = () => client.invalidateQueries({ queryKey: blogKeys.all })
    const remove = useMutation({
        mutationFn: (id: string) => blogApi.deleteTaxonomy(kind, id),
        onSuccess: () => {
            setDeleting(null)
            void refresh()
        },
    })
    const reorder = useMutation({
        mutationFn: (rows: BlogTaxonomy[]) =>
            blogApi.reorder(
                kind,
                rows.map((item) => item.id),
            ),
        onMutate: async (rows) => {
            const key = blogKeys.taxonomy(kind)
            await client.cancelQueries({ queryKey: key })
            const previous = client.getQueryData<BlogTaxonomy[]>(key)
            if (previous) {
                const ids = new Set(rows.map((item) => item.id))
                let index = 0
                client.setQueryData(
                    key,
                    previous.map((item) =>
                        ids.has(item.id) ? rows[index++] : item,
                    ),
                )
            }
            return { previous }
        },
        onError: (_error, _rows, context) => {
            if (context?.previous)
                client.setQueryData(blogKeys.taxonomy(kind), context.previous)
        },
        onSettled: refresh,
    })
    return {
        query,
        items,
        total: filtered.length,
        page,
        pageSize,
        editing,
        deleting,
        setEditing,
        setDeleting,
        remove,
        reorder,
        refresh,
        setPage,
        setSearch: (value: string) => {
            setSearch(value.trim())
            setPage(1)
        },
        changePageSize: (value: number) => {
            setPageSize(value)
            setPage(1)
        },
    }
}
