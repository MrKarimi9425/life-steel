import Tooltip from '@/components/ui/Tooltip'
import classNames from '@/utils/classNames'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type TableActionTone = 'danger' | 'edit' | 'success' | 'view'

interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode
    label: string
    tone: TableActionTone
}

const toneClasses: Record<TableActionTone, string> = {
    danger: 'bg-red-100 text-red-600 hover:bg-red-200',
    edit: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
    success: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
    view: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
}

export default function TableActionButton({
    className,
    icon,
    label,
    tone,
    type = 'button',
    ...props
}: TableActionButtonProps) {
    return (
        <Tooltip title={label}>
            <button
                {...props}
                aria-label={label}
                className={classNames(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    toneClasses[tone],
                    className,
                )}
                type={type}
            >
                {icon}
            </button>
        </Tooltip>
    )
}
