import type { ReactNode } from 'react'
import classNames from '@/utils/classNames'

export default function ListFilters({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={classNames(
                'grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3',
                className,
            )}
        >
            {children}
        </div>
    )
}
