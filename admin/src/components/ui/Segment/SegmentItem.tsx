import { forwardRef } from 'react'
import classNames from 'classnames'
import type { CommonProps, TypeAttributes } from '../@types/common'
import { useSegment, type SegmentValue } from './context'
import type { ComponentPropsWithRef, ReactNode } from 'react'

type ChildrenParams = {
    active: boolean
    disabled: boolean
    value: string
    onSegmentItemClick: () => void
}

export interface SegmentItemProps
    extends
        Omit<CommonProps, 'children'>,
        Omit<ComponentPropsWithRef<'button'>, 'children'> {
    children: ((params: ChildrenParams) => ReactNode) | ReactNode
    disabled?: boolean
    size?: TypeAttributes.Size
    value: string
}

const SegmentItem = forwardRef<HTMLButtonElement, SegmentItemProps>(
    (props, ref) => {
        const { children, className, disabled = false, value, ...rest } = props
        const context = useSegment()
        const active = (context.value as string[] | undefined)?.includes(value)

        const onSegmentItemClick = () => {
            if (disabled) return
            if (!active) {
                context.onActive?.(
                    context.selectionType === 'multiple'
                        ? [...((context.value as string[]) ?? []), value]
                        : value,
                )
                return
            }
            if (context.selectionType === 'multiple') {
                context.onDeactivate?.(value as SegmentValue)
            }
        }

        if (typeof children === 'function') {
            return children({
                active: Boolean(active),
                disabled,
                value,
                onSegmentItemClick,
            })
        }

        return (
            <button
                ref={ref}
                className={classNames(
                    'segment-item px-3 py-2 text-sm',
                    active && 'segment-item-active',
                    disabled && 'segment-item-disabled',
                    className,
                )}
                disabled={disabled}
                type="button"
                onClick={onSegmentItemClick}
                {...rest}
            >
                {children}
            </button>
        )
    },
)

SegmentItem.displayName = 'SegmentItem'

export default SegmentItem
