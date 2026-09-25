import { Navigate, Outlet } from 'react-router'
import { useAuthStore, type UserRole } from '@/features/auth'

interface RoleRouteProps {
    allowedRoles: readonly UserRole[]
    redirectTo?: string
}

export function RoleRoute({ allowedRoles, redirectTo = '/' }: RoleRouteProps) {
    const principal = useAuthStore((state) => state.principal)

    return principal && allowedRoles.includes(principal.role) ? (
        <Outlet />
    ) : (
        <Navigate replace to={redirectTo} />
    )
}
