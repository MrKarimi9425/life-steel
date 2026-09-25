import ArrowRight02Icon from '@/assets/icons/iconsax/linear/arrow-right-02.svg?react'
import ArrowLeft02Icon from '@/assets/icons/iconsax/linear/arrow-left-02.svg?react'
import ArrowUp02Icon from '@/assets/icons/iconsax/linear/arrow-up-02.svg?react'
import ArrowDown02Icon from '@/assets/icons/iconsax/linear/arrow-down-02.svg?react'
import { forwardRef } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '../@types/common'
import type { Placement } from '@floating-ui/react'
import type { ReactNode, HTMLProps } from 'react'

export interface DropdownToggleSharedProps {
    renderTitle?: ReactNode
    placement?: Placement
    toggleClassName?: string
    disabled?: boolean
}

interface DropdownToggleProps extends CommonProps, DropdownToggleSharedProps {
    id?: string
}

const DropdownToggleDefaultContent = ({
    placement,
    children,
}: {
    placement: Placement
    children: string | ReactNode
}) => {
    if (placement && placement.includes('right')) {
        return (
            <>
                {children}
                <ArrowRight02Icon
                    aria-hidden="true"
                    focusable="false"
                    height={18}
                    width={18}
                />
            </>
        )
    }

    if (placement && placement.includes('left')) {
        return (
            <>
                <ArrowLeft02Icon
                    aria-hidden="true"
                    focusable="false"
                    height={18}
                    width={18}
                />
                {children}
            </>
        )
    }

    if (placement && placement.includes('right')) {
        return (
            <>
                {children}
                <ArrowUp02Icon
                    aria-hidden="true"
                    focusable="false"
                    height={18}
                    width={18}
                />
            </>
        )
    }

    return (
        <>
            {children}
            <ArrowDown02Icon
                aria-hidden="true"
                focusable="false"
                height={18}
                width={18}
            />
        </>
    )
}

const DropdownToggle = forwardRef<
    HTMLDivElement,
    DropdownToggleProps & HTMLProps<HTMLDivElement>
>((props, ref) => {
    const {
        className,
        renderTitle,
        children,
        placement = 'bottom-start',
        disabled,
        toggleClassName,
        ...rest
    } = props

    const toggleClass = 'dropdown-toggle'
    const disabledClass = 'dropdown-toggle-disabled'

    const dropdownToggleClass = classNames(
        toggleClass,
        className,
        toggleClassName,
        disabled && disabledClass,
    )

    const dropdownToggleDefaultClass = classNames(
        dropdownToggleClass,
        'dropdown-toggle-default',
    )

    if (renderTitle) {
        return (
            <div className={dropdownToggleClass} {...rest} ref={ref}>
                {renderTitle}
            </div>
        )
    }

    return (
        <div ref={ref} className={dropdownToggleDefaultClass} {...rest}>
            <span className="flex items-center gap-1">
                <DropdownToggleDefaultContent placement={placement}>
                    {children}
                </DropdownToggleDefaultContent>
            </span>
        </div>
    )
})

DropdownToggle.displayName = 'DropdownToggle'

export default DropdownToggle
