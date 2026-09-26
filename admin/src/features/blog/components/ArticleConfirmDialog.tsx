import ConfirmDialog from '@/components/shared/ConfirmDialog'
type Props = {
    kind: 'archive' | 'delete'
    title: string
    pending: boolean
    onClose: () => void
    onConfirm: () => void
}
export default function ArticleConfirmDialog({
    kind,
    title,
    pending,
    onClose,
    onConfirm,
}: Props) {
    const deleting = kind === 'delete'
    const close = () => {
        if (!pending) onClose()
    }
    return (
        <ConfirmDialog
            isOpen
            title={deleting ? 'حذف دائمی مقاله' : 'بایگانی مقاله'}
            type={deleting ? 'danger' : 'warning'}
            confirmText={deleting ? 'حذف دائمی' : 'بایگانی'}
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
            {deleting
                ? `مقاله «${title}» و تصاویر آن برای همیشه حذف شوند؟ این کار قابل بازگشت نیست.`
                : `مقاله «${title}» بایگانی شود؟`}
        </ConfirmDialog>
    )
}
