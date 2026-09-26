import ConfirmDialog from '@/components/shared/ConfirmDialog'
type Props = {
    title: string
    pending: boolean
    onClose: () => void
    onConfirm: () => void
}
export default function BlogTaxonomyConfirmDialog({
    title,
    pending,
    onClose,
    onConfirm,
}: Props) {
    const close = () => {
        if (!pending) onClose()
    }
    return (
        <ConfirmDialog
            isOpen
            title="حذف دائمی"
            type="danger"
            confirmText="حذف دائمی"
            confirmButtonProps={{ loading: pending }}
            cancelButtonProps={{ disabled: pending }}
            closable={!pending}
            shouldCloseOnEsc={!pending}
            shouldCloseOnOverlayClick={!pending}
            onClose={close}
            onCancel={close}
            onConfirm={() => {
                if (!pending) onConfirm()
            }}
        >
            «{title}» برای همیشه حذف شود؟ مورد استفاده شده در مقاله قابل حذف
            نیست.
        </ConfirmDialog>
    )
}
