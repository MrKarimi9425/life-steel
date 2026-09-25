import { Navigate, Outlet } from 'react-router'
import { hasPermission, useAuthStore } from '@/features/auth'

interface PermissionRouteProps {
    permission: string
    redirectTo?: string
}

export function PermissionRoute({
    permission,
    redirectTo = '/',
}: PermissionRouteProps) {
    const principal = useAuthStore((state) => state.principal)

    return hasPermission(principal, permission) ? (
        <Outlet />
    ) : (
        <Navigate replace to={redirectTo} />
    )
}
