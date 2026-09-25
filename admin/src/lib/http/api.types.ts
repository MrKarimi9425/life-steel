export interface ApiResponse<TData> {
    data: TData | null
    message: string
}

export interface PaginatedList<TItem> {
    list: TItem[]
    total: number
}

export type ApiFieldErrors = Record<string, string | string[]>

export interface ApiErrorPayload {
    error?: {
        code?: string
        message?: string
        fields?: ApiFieldErrors
    }
}
