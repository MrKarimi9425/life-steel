import classNames from '@/utils/classNames'
import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & { active?: boolean }

/** Adapted from the source template's RichTextEditor/toolButtons/ToolButton. */
export default function BlockEditorToolButton({
    className,
    disabled,
    active,
    title,
    children,
    ...rest
}: Props) {
    return (
        <button
            {...rest}
            title={title}
            aria-label={title}
            aria-pressed={active}
            className={classNames(
                'tool-button text-xl heading-text hover:text-primary flex items-center p-1.5 rounded-lg',
                active && 'text-primary',
                disabled && 'opacity-20 cursor-not-allowed',
                className,
            )}
            type="button"
            disabled={disabled}
        >
            {children}
        </button>
    )
}
