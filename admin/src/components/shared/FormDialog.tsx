import type { ReactNode } from 'react'
import classNames from 'classnames'
import Dialog, { type DialogProps } from '@/components/ui/Dialog'

interface FormDialogProps extends Omit<
    DialogProps,
    'children' | 'isOpen' | 'onClose' | 'title'
> {
    children: ReactNode
    isOpen: boolean
    isPending?: boolean
    title?: string
    onClose: () => void
}

export function FormDialogBody({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={classNames(
                'form-dialog-body minimal-scrollbar',
                className,
            )}
        >
            {children}
        </div>
    )
}

export function FormDialogActions({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={classNames(
                'form-dialog-actions flex shrink-0 items-center justify-end gap-2',
                className,
            )}
        >
            {children}
        </div>
    )
}

export default function FormDialog({
    children,
    isOpen,
    isPending = false,
    title,
    width = 600,
    onClose,
    className,
    ...rest
}: FormDialogProps) {
    const handleClose = () => {
        if (!isPending) onClose()
    }

    return (
        <Dialog
            closable={!isPending}
            className={classNames('form-dialog-responsive', className)}
            contentLabel={title}
            isOpen={isOpen}
            shouldCloseOnEsc={!isPending}
            shouldCloseOnOverlayClick={!isPending}
            width={width}
            onClose={handleClose}
            onRequestClose={handleClose}
            {...rest}
        >
            {title && <h4 className="mb-4">{title}</h4>}
            {children}
        </Dialog>
    )
}
