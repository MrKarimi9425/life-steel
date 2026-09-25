import type { ReactNode } from 'react'
import classNames from '@/utils/classNames'

interface PageHeaderProps {
    title: ReactNode
    subtitle: ReactNode
    actions?: ReactNode
    className?: string
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={classNames(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                <h3>{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    )
}
