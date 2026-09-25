import type { ReactNode } from 'react'

type PageFormProps = {
    children: ReactNode
    actions?: ReactNode
}

export default function PageForm({ children, actions }: PageFormProps) {
    return (
        <div className="flex flex-col gap-6">
            <div>{children}</div>
            {actions && (
                <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                    {actions}
                </div>
            )}
        </div>
    )
}
