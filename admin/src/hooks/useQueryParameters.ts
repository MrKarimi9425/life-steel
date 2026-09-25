import { useMemo } from 'react'
import { useLocation } from 'react-router'

export function useQueryParameters(): URLSearchParams {
    const { search } = useLocation()
    return useMemo(() => new URLSearchParams(search), [search])
}
