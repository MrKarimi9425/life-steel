import type { ReactNode, CSSProperties } from 'react'

export interface CommonProps {
    id?: string
    className?: string
    children?: ReactNode
    style?: CSSProperties
}

export type TraslationFn = (
    key: string,
    fallback?: string | Record<string, string | number>,
) => string
