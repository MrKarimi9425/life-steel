import TickCircleIcon from '@/assets/icons/iconsax/linear/tick-circle.svg?react'
import InfoCircleIcon from '@/assets/icons/iconsax/linear/info-circle.svg?react'
import DangerIcon from '@/assets/icons/iconsax/linear/danger.svg?react'
import CloseCircleIcon from '@/assets/icons/iconsax/linear/close-circle.svg?react'
import { forwardRef } from 'react'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import type { CommonProps, TypeAttributes } from '../@types/common'

export interface AlertProps extends CommonProps {
    customIcon?: ReactNode
    showIcon?: boolean
    title?: ReactNode
    type?: TypeAttributes.Status
}

const typeMap = {
    success: {
        background: 'bg-success-subtle',
        color: 'text-success',
        icon: <TickCircleIcon aria-hidden="true" focusable="false" />,
    },
    info: {
        background: 'bg-info-subtle',
        color: 'text-info',
        icon: <InfoCircleIcon aria-hidden="true" focusable="false" />,
    },
    warning: {
        background: 'bg-warning-subtle',
        color: 'text-warning',
        icon: <DangerIcon aria-hidden="true" focusable="false" />,
    },
    danger: {
        background: 'bg-error-subtle',
        color: 'text-error',
        icon: <CloseCircleIcon aria-hidden="true" focusable="false" />,
    },
}

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
    const {
        children,
        className,
        customIcon,
        showIcon = false,
        title,
        type = 'warning',
        ...rest
    } = props
    const appearance = typeMap[type]

    return (
        <div
            className={classNames(
                'alert rounded-xl',
                appearance.background,
                appearance.color,
                !title && 'font-semibold',
                className,
            )}
            ref={ref}
            {...rest}
        >
            <div
                className={classNames(
                    'flex gap-2',
                    !title && Boolean(children) && 'items-center',
                )}
            >
                {showIcon && (
                    <span className="text-2xl">
                        {customIcon ?? appearance.icon}
                    </span>
                )}
                <div>
                    {title && (
                        <div className="mb-1 text-lg font-semibold">
                            {title}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
})

Alert.displayName = 'Alert'

export default Alert
