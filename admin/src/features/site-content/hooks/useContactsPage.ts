import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { siteContentApi, siteKeys } from '../site-content.api'
import type { ContactInformation } from '../site-content.types'
export function useContactsPage() {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.contacts,
        queryFn: siteContentApi.contacts,
    })
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [editing, setEditing] = useState<ContactInformation | 'new' | null>(
        null,
    )
    const [deleting, setDeleting] = useState<ContactInformation | null>(null)
    const [locationOpen, setLocationOpen] = useState(false)
    const refresh = () =>
        client.invalidateQueries({ queryKey: siteKeys.contacts })
    const remove = useMutation({
        mutationFn: siteContentApi.removeContact,
        onSuccess: () => {
            setDeleting(null)
            void refresh()
        },
    })
    const reorder = useMutation({
        mutationFn: (rows: ContactInformation[]) =>
            siteContentApi.reorder(rows.map((r) => r.id)),
        onMutate: async (rows) => {
            await client.cancelQueries({ queryKey: siteKeys.contacts })
            const previous = client.getQueryData<ContactInformation[]>(
                siteKeys.contacts,
            )
            const ids = new Set(rows.map((r) => r.id))
            let index = 0
            client.setQueryData(
                siteKeys.contacts,
                previous?.map((r) => (ids.has(r.id) ? rows[index++] : r)),
            )
            return { previous }
        },
        onError: (_error, _rows, context) =>
            client.setQueryData(siteKeys.contacts, context?.previous),
        onSettled: refresh,
    })
    const filtered = (query.data ?? []).filter((row) =>
        row.translations.some((t) =>
            `${t.title} ${t.value}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        ),
    )
    return {
        query,
        page,
        pageSize,
        setPage,
        setSearch: (value: string) => {
            setSearch(value)
            setPage(1)
        },
        changePageSize: (size: number) => {
            setPageSize(size)
            setPage(1)
        },
        editing,
        setEditing,
        deleting,
        setDeleting,
        locationOpen,
        setLocationOpen,
        remove,
        reorder,
        refresh,
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
    }
}
