import { useState } from 'react'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import {
    FloatingPortal,
    autoUpdate,
    flip,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import Arrow from './Arrow'
import type { CommonProps } from '../@types/common'
import type { ArrowPlacement } from './Arrow'
import type { ReactNode } from 'react'

export interface TooltipProps extends CommonProps {
    isOpen?: boolean
    placement?: ArrowPlacement
    title: string | ReactNode
    wrapperClass?: string
    disabled?: boolean
}

const Tooltip = ({
    className,
    children,
    isOpen = false,
    placement = 'top',
    title,
    wrapperClass,
    disabled,
}: TooltipProps) => {
    const [tooltipOpen, setTooltipOpen] = useState(isOpen)
    const tooltipColor = {
        background: 'bg-gray-800 dark:bg-black',
        arrow: 'text-gray-800 dark:text-black',
    }
    const { refs, floatingStyles, context } = useFloating({
        open: tooltipOpen,
        onOpenChange: (open) => {
            if (!disabled) setTooltipOpen(open)
        },
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(7),
            flip({ fallbackAxisSideDirection: 'start' }),
            shift(),
        ],
    })
    const { getReferenceProps, getFloatingProps } = useInteractions([
        useHover(context, { move: false }),
        useFocus(context),
        useDismiss(context),
        useRole(context, { role: 'tooltip' }),
    ])

    return (
        <>
            <span
                ref={refs.setReference}
                {...getReferenceProps()}
                className={classNames('tooltip-wrapper', wrapperClass)}
            >
                {children}
            </span>
            <FloatingPortal>
                {tooltipOpen && (
                    <AnimatePresence>
                        <motion.div
                            ref={refs.setFloating}
                            {...getFloatingProps()}
                            animate={{ opacity: 1, visibility: 'visible' }}
                            className={classNames(
                                'tooltip',
                                tooltipColor.background,
                                className,
                            )}
                            initial={{ opacity: 0, visibility: 'hidden' }}
                            style={floatingStyles}
                            transition={{ duration: 0.15, type: 'tween' }}
                        >
                            <span>{title}</span>
                            <Arrow
                                color={tooltipColor.arrow}
                                placement={context.placement}
                            />
                        </motion.div>
                    </AnimatePresence>
                )}
            </FloatingPortal>
        </>
    )
}

export default Tooltip
