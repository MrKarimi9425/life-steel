import { Navigate, Outlet } from 'react-router'
import { useAuthStore, type AuthPrincipal } from '@/features/auth'

interface AccountTypeRouteProps {
    accountType: AuthPrincipal['accountType']
    redirectTo?: string
}

export function AccountTypeRoute({
    accountType,
    redirectTo = '/',
}: AccountTypeRouteProps) {
    const principal = useAuthStore((state) => state.principal)

    return principal?.accountType === accountType ? (
        <Outlet />
    ) : (
        <Navigate replace to={redirectTo} />
    )
}
