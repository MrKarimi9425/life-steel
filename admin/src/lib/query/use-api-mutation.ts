import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query'
import { normalizeError, reportError, type AppError } from '@/lib/errors'

type MutationOptions<TData, TVariables, TContext> = Omit<
    UseMutationOptions<TData, AppError, TVariables, TContext>,
    'mutationFn' | 'onError'
> & {
    mutationFn: (variables: TVariables) => Promise<TData>
    notifyOnError?: boolean
    onError?: UseMutationOptions<
        TData,
        AppError,
        TVariables,
        TContext
    >['onError']
}

export function useApiMutation<TData, TVariables = void, TContext = unknown>(
    options: MutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, AppError, TVariables, TContext> {
    const {
        mutationFn,
        notifyOnError = true,
        onError,
        ...mutationOptions
    } = options

    return useMutation<TData, AppError, TVariables, TContext>({
        ...mutationOptions,
        mutationFn: async (variables) => {
            try {
                return await mutationFn(variables)
            } catch (error) {
                throw normalizeError(error)
            }
        },
        onError: (error, variables, result, context) => {
            if (notifyOnError) {
                reportError(error)
            }
            onError?.(error, variables, result, context)
        },
    })
}
