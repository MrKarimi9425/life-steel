import { forwardRef, type ElementType } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '../@types/common'

export interface SkeletonProps extends CommonProps {
    animation?: boolean
    asElement?: ElementType
    height?: string | number
    width?: string | number
}

const Skeleton = forwardRef<ElementType, SkeletonProps>((props, ref) => {
    const {
        animation = true,
        asElement: Component = 'span',
        className,
        height,
        style,
        width,
    } = props

    return (
        <Component
            className={classNames(
                'skeleton skeleton-block',
                animation && 'animate-pulse',
                className,
            )}
            ref={ref}
            style={{ width, height, ...style }}
        />
    )
})

Skeleton.displayName = 'Skeleton'

export default Skeleton
