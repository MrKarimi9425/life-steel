import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePanelPreferencesStore } from '@/store/panelPreferencesStore'

export function useServerPagination(
    resetKey?: unknown,
    pageSizeOverride?: number,
) {
    const defaultPageSize = usePanelPreferencesStore(
        (state) => state.defaultPageSize,
    )
    const [searchParams, setSearchParams] = useSearchParams()
    const usesUrl = pageSizeOverride === undefined
    const effectiveDefaultPageSize = pageSizeOverride ?? defaultPageSize
    const [localPageIndex, setLocalPageIndex] = useState(1)
    const [localPageSize, setLocalPageSize] = useState(effectiveDefaultPageSize)
    const previousResetKey = useRef(resetKey)
    const pageIndex = usesUrl
        ? toPositiveInteger(searchParams.get('page'), 1)
        : localPageIndex
    const pageSize = usesUrl
        ? toPositiveInteger(
              searchParams.get('pageSize'),
              effectiveDefaultPageSize,
          )
        : localPageSize

    const updateUrlPagination = (page: number, size: number) => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current)
                next.set('page', String(page))
                next.set('pageSize', String(size))
                return next
            },
            { replace: true },
        )
    }

    const setPageIndex = (value: number) => {
        if (usesUrl) updateUrlPagination(value, pageSize)
        else setLocalPageIndex(value)
    }

    useEffect(() => {
        if (Object.is(previousResetKey.current, resetKey)) return
        previousResetKey.current = resetKey

        if (usesUrl) updateUrlPagination(1, pageSize)
        else setLocalPageIndex(1)
        // resetKey intentionally owns resetting a filtered list.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey])

    useEffect(() => {
        if (usesUrl) {
            if (!searchParams.has('page') || !searchParams.has('pageSize')) {
                updateUrlPagination(pageIndex, pageSize)
            }
        } else {
            setLocalPageSize(effectiveDefaultPageSize)
            setLocalPageIndex(1)
        }
        // Only preference/override changes should reset local pagination.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveDefaultPageSize, usesUrl])

    const setPageSize = (value: number) => {
        if (usesUrl) updateUrlPagination(1, value)
        else {
            setLocalPageSize(value)
            setLocalPageIndex(1)
        }
    }

    return { pageIndex, pageSize, setPageIndex, setPageSize }
}

function toPositiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
