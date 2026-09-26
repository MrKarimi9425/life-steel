import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '@/features/languages'
import type { MediaAsset } from '@/features/media'
import type { AttributeDefinition, Category } from '../types'
import { productsApi } from './products.api'
import type { ProductDialogKind } from './products.types'
import type { ProductListItem } from './products.types'

export function useProductsPage() {
    const client = useQueryClient()
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [dialog, setDialog] = useState<{
        kind: ProductDialogKind
        productId: string | null
    } | null>(null)

    const languagesQuery = useQuery({
        queryKey: ['languages'],
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Language[]>>('languages')).data
                .data ?? [],
    })
    const categoriesQuery = useQuery({
        queryKey: ['catalog', 'categories'],
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Category[]>>('catalog/categories'))
                .data.data ?? [],
    })
    const attributesQuery = useQuery({
        queryKey: ['catalog', 'attributes'],
        enabled: dialog?.kind === 'attributes',
        queryFn: async () =>
            (
                await apiClient.get<ApiResponse<AttributeDefinition[]>>(
                    'catalog/attributes',
                )
            ).data.data ?? [],
    })
    const mediaQuery = useQuery({
        queryKey: ['media'],
        enabled: dialog?.kind === 'media',
        queryFn: async () =>
            (await apiClient.get<ApiResponse<MediaAsset[]>>('media')).data
                .data ?? [],
    })
    const productsQuery = useQuery({
        queryKey: [
            'catalog',
            'products',
            search,
            status,
            categoryId,
            page,
            pageSize,
        ],
        queryFn: () => {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
            })
            if (search) params.set('search', search)
            if (status) params.set('status', status)
            if (categoryId) params.set('categoryId', categoryId)
            return productsApi.list(params)
        },
    })
    const archiveMutation = useMutation({
        mutationFn: productsApi.archive,
        onSuccess: () => void refresh(),
    })
    const deleteMutation = useMutation({
        mutationFn: productsApi.remove,
        onSuccess: () => {
            void refresh()
            void client.invalidateQueries({ queryKey: ['media'] })
        },
    })
    const reorderMutation = useMutation({
        mutationFn: (items: ProductListItem[]) =>
            productsApi.reorder(items.map((item) => item.id)),
        onMutate: async (items) => {
            const queryKey = [
                'catalog',
                'products',
                search,
                status,
                categoryId,
                page,
                pageSize,
            ]
            await client.cancelQueries({ queryKey })
            const previous = client.getQueryData<{
                items: ProductListItem[]
                total: number
                page: number
                pageSize: number
            }>(queryKey)
            if (previous) {
                client.setQueryData(queryKey, { ...previous, items })
            }
            return { queryKey, previous }
        },
        onError: (_error, _items, context) => {
            if (context?.previous) {
                client.setQueryData(context.queryKey, context.previous)
            }
        },
        onSettled: () => {
            void client.invalidateQueries({ queryKey: ['catalog', 'products'] })
        },
    })

    const languages = useMemo(
        () => (languagesQuery.data ?? []).filter((item) => item.isActive),
        [languagesQuery.data],
    )
    const defaultLanguageId = languagesQuery.data?.find(
        (item) => item.isDefault,
    )?.id
    const refresh = () => {
        void client.invalidateQueries({ queryKey: ['catalog', 'products'] })
        void client.invalidateQueries({ queryKey: ['catalog', 'product'] })
        void client.invalidateQueries({ queryKey: ['catalog', 'pricing'] })
    }
    const closeDialog = () => setDialog(null)
    const openDialog = (kind: ProductDialogKind, productId: string | null) =>
        setDialog({ kind, productId })
    const changePageSize = (value: number) => {
        setPageSize(value)
        setPage(1)
    }

    return {
        archiveMutation,
        attributesQuery,
        categoriesQuery,
        categoryId,
        changePageSize,
        closeDialog,
        defaultLanguageId,
        deleteMutation,
        dialog,
        languages,
        mediaQuery,
        openDialog,
        page,
        pageSize,
        productsQuery,
        refresh,
        reorderMutation,
        reorderProducts: (items: ProductListItem[]) =>
            reorderMutation.mutate(items),
        search,
        setCategoryId: (value: string) => {
            setCategoryId(value)
            setPage(1)
        },
        setPage,
        setSearch: (value: string) => {
            setSearch(value)
            setPage(1)
        },
        setStatus: (value: string) => {
            setStatus(value)
            setPage(1)
        },
        status,
    }
}
