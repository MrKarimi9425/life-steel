import ConfirmDialog from '@/components/shared/ConfirmDialog'
export default function SiteDeleteDialog({
    title,
    pending,
    onClose,
    onConfirm,
}: {
    title: string
    pending: boolean
    onClose: () => void
    onConfirm: () => void
}) {
    return (
        <ConfirmDialog
            isOpen
            title="حذف دائمی"
            type="danger"
            confirmText="حذف دائمی"
            confirmButtonProps={{ loading: pending }}
            cancelButtonProps={{ disabled: pending }}
            closable={!pending}
            shouldCloseOnOverlayClick={!pending}
            shouldCloseOnEsc={!pending}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={onConfirm}
        >
            «{title}» برای همیشه حذف شود؟ این کار قابل بازگشت نیست.
        </ConfirmDialog>
    )
}
