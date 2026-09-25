import type { ReactNode } from 'react'
import classNames from '@/utils/classNames'

export default function SummaryMetricCard({
    title,
    value,
    description,
    tone = 'default',
}: {
    title: ReactNode
    value: ReactNode
    description: ReactNode
    tone?: 'default' | 'strong'
}) {
    const strong = tone === 'strong'

    return (
        <div
            className={classNames(
                'rounded-xl border p-4',
                strong
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-700 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-700',
            )}
        >
            <div
                className={classNames(
                    'text-sm',
                    strong ? 'text-gray-300' : 'text-gray-500',
                )}
            >
                {title}
            </div>
            <div
                className={classNames(
                    'mt-2 text-2xl font-bold',
                    !strong && 'text-gray-900 dark:text-gray-100',
                )}
            >
                {value}
            </div>
            <div
                className={classNames(
                    'mt-1 text-xs',
                    strong ? 'text-gray-300' : 'text-gray-500',
                )}
            >
                {description}
            </div>
        </div>
    )
}
