import type { PropsWithChildren } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/features/auth'
import { DashboardLayout } from './DashboardLayout'

interface DashboardRouteFrameProps extends PropsWithChildren {
    pageBackgroundType?: 'default' | 'plain'
    pageContainerType?: 'default' | 'contained' | 'gutterless'
}

export function DashboardRouteFrame({
    children,
    pageBackgroundType,
    pageContainerType,
}: DashboardRouteFrameProps) {
    const principal = useAuthStore((state) => state.principal)

    if (!principal) return null
    if (principal.mustChangePassword) {
        return <Navigate replace to="/change-password" />
    }

    return (
        <DashboardLayout
            pageBackgroundType={pageBackgroundType ?? 'default'}
            pageContainerType={pageContainerType}
            role={principal.role}
            roleLabel={principal.isOwner ? 'مدیر اصلی' : 'مدیر'}
        >
            {children ?? <Outlet />}
        </DashboardLayout>
    )
}
