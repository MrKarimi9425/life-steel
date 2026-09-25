import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import {
    AuthBootstrapLoading,
    authQueryKeys,
    getCurrentPrincipal,
    useAuthStore,
} from '@/features/auth'
import { normalizeError } from '@/lib/errors'

export function ProtectedRoute() {
    const location = useLocation()
    const status = useAuthStore((state) => state.status)
    const mustChangePassword = useAuthStore((state) => state.principal?.mustChangePassword)
    const setAnonymous = useAuthStore((state) => state.setAnonymous)
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
    const currentPrincipalQuery = useQuery({
        queryKey: authQueryKeys.currentPrincipal,
        queryFn: getCurrentPrincipal,
        enabled: status === 'bootstrapping',
        gcTime: Infinity,
        meta: { suppressAuthenticationError: true },
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: Infinity,
    })
    const bootstrapError = currentPrincipalQuery.isError
        ? normalizeError(currentPrincipalQuery.error)
        : null

    useEffect(() => {
        if (status !== 'bootstrapping') return

        if (currentPrincipalQuery.data) {
            setAuthenticated(currentPrincipalQuery.data)
            return
        }

        if (
            currentPrincipalQuery.isError &&
            bootstrapError?.kind === 'authentication'
        ) {
            setAnonymous()
        }
    }, [
        currentPrincipalQuery.data,
        currentPrincipalQuery.isError,
        bootstrapError?.kind,
        setAnonymous,
        setAuthenticated,
        status,
    ])

    if (status === 'bootstrapping') {
        if (
            currentPrincipalQuery.isError &&
            bootstrapError?.kind !== 'authentication'
        ) {
            return (
                <div className="flex min-h-screen items-center justify-center p-6">
                    <div className="w-full max-w-2xl">
                        <QueryErrorState
                            error={currentPrincipalQuery.error}
                            title="برقراری ارتباط با سرور با خطا مواجه شد."
                            onRetry={() => void currentPrincipalQuery.refetch()}
                        />
                    </div>
                </div>
            )
        }

        return <AuthBootstrapLoading />
    }

    if (status !== 'authenticated') return <Navigate replace to="/sign-in" />
    if (mustChangePassword && location.pathname !== '/change-password') {
        return <Navigate replace to="/change-password" />
    }
    return <Outlet />
}
