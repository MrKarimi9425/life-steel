import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { normalizeError, reportError, shouldRetryRequest } from '@/lib/errors'

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onSuccess: (result, _variables, _context, mutation) => {
            if (mutation.meta?.suppressGlobalSuccess === true) return
            const response = result as {
                data?: { message?: string }
                message?: string
            } | null
            toast.success(
                response?.data?.message ??
                    response?.message ??
                    'عملیات با موفقیت انجام شد.',
            )
        },
        onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.suppressGlobalError !== true)
                reportError(error)
        },
    }),
    queryCache: new QueryCache({
        onError: (error, query) => {
            const appError = normalizeError(error)
            const suppressGlobalError = query.meta?.suppressGlobalError === true
            if (suppressGlobalError) return

            if (appError.kind === 'authentication') return

            reportError(appError)
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: shouldRetryRequest,
        },
        mutations: {
            retry: false,
        },
    },
})
