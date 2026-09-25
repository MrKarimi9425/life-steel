import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import type { MediaAsset } from '@/features/media'

type Props = {
    asset: MediaAsset | null
    onClose: () => void
}

export default function MediaPreviewDialog({ asset, onClose }: Props) {
    const url = asset?.path
        ? `/api/public/media/${asset.path}`
        : asset?.externalUrl
    return (
        <FormDialog
            isOpen={asset !== null}
            title="پیش نمایش فایل"
            width={820}
            onClose={onClose}
        >
            <FormDialogBody>
                {asset?.kind === 'IMAGE' && url ? (
                    <img
                        alt={asset.translations.find((item) => item.altText)?.altText ?? asset.originalFileName ?? ''}
                        className="mx-auto max-h-[65vh] max-w-full rounded-xl object-contain"
                        src={url}
                    />
                ) : asset?.kind === 'VIDEO' && url ? (
                    <video className="mx-auto max-h-[65vh] max-w-full rounded-xl" controls src={url} />
                ) : null}
            </FormDialogBody>
            <FormDialogActions>
                <Button type="button" onClick={onClose}>بستن</Button>
            </FormDialogActions>
        </FormDialog>
    )
}
