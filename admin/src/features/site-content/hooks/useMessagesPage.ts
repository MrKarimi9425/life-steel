import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { siteContentApi, siteKeys } from '../site-content.api'
import type { ContactMessage, MessageFilters } from '../site-content.types'
export function useMessagesPage() {
    const client = useQueryClient()
    const [filters, setFilters] = useState<MessageFilters>({
        search: '',
        status: '',
        page: 1,
        pageSize: 10,
    })
    const query = useQuery({
        queryKey: [...siteKeys.messages, filters],
        queryFn: () => siteContentApi.messages(filters),
    })
    const [opened, setOpened] = useState<ContactMessage | null>(null)
    const [deleting, setDeleting] = useState<ContactMessage | null>(null)
    const remove = useMutation({
        mutationFn: siteContentApi.removeMessage,
        onSuccess: () => {
            setDeleting(null)
            if (query.data?.items.length === 1 && filters.page > 1)
                setFilters((f) => ({ ...f, page: f.page - 1 }))
            void client.invalidateQueries({ queryKey: siteKeys.messages })
        },
    })
    return {
        filters,
        setFilters,
        query,
        opened,
        setOpened,
        deleting,
        setDeleting,
        remove,
    }
}
