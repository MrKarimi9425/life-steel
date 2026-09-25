import type { ReactNode } from 'react'

export default function TableActions({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
            {children}
        </div>
    )
}
