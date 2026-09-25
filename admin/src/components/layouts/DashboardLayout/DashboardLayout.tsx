import type { PropsWithChildren } from 'react'
import classNames from 'classnames'
import type { UserRole } from '@/features/auth'
import CollapsibleSide from '@/components/layouts/PostLoginLayout/components/CollapsibleSide'

interface DashboardLayoutProps extends PropsWithChildren {
    role: UserRole
    roleLabel: string
    pageBackgroundType?: 'default' | 'plain'
    pageContainerType?: 'default' | 'contained' | 'gutterless'
}

export function DashboardLayout({
    children,
    pageBackgroundType = 'default',
}: DashboardLayoutProps) {
    return (
        <CollapsibleSide>
            <div
                className={classNames(
                    'flex h-full flex-auto flex-col',
                    pageBackgroundType === 'plain' &&
                        'bg-white dark:bg-gray-900',
                )}
            >
                <main className="h-full">
                    <div
                        className={classNames(
                            'page-container container relative mx-auto flex h-full !max-w-none flex-auto flex-col px-4 py-4 sm:py-6 lg:px-8',
                        )}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </CollapsibleSide>
    )
}
