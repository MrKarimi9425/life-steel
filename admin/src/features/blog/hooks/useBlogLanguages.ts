import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '@/features/languages'

export function useBlogLanguages(enabled = true) {
    const query = useQuery({
        queryKey: ['languages'],
        enabled,
        meta: { suppressGlobalError: true },
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Language[]>>('languages')).data
                .data ?? [],
    })
    const languages = useMemo(
        () => (query.data ?? []).filter((item) => item.isActive),
        [query.data],
    )
    return {
        query,
        languages,
        persianId: languages.find((item) => item.code === 'fa')?.id,
    }
}
