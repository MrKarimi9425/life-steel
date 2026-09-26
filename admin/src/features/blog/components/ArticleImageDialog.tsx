import { useState } from 'react'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import type { BlockEditorImage } from '@/components/shared/BlockEditor'
import Button from '@/components/ui/Button'
import ImageSelectionGrid from '@/components/shared/ImageSelectionGrid'
import type { MediaAsset } from '@/features/media'

type Props = {
    assets: MediaAsset[]
    languageId: string
    onFinish: (image: BlockEditorImage | null) => void
    title?: string
    emptyMessage?: string
}
export default function ArticleImageDialog({
    assets,
    languageId,
    onFinish,
    title = 'انتخاب تصویر از گالری مقاله',
    emptyMessage = 'ابتدا تصاویر را از اکشن گالری مقاله بارگذاری کنید.',
}: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const image = assets.find((item) => item.id === selectedId)
    const options = assets
        .map((item) => ({
            id: item.id,
            src: item.path ? `/api/public/media/${item.path}` : '',
            label:
                item.translations.find(
                    (entry) => entry.languageId === languageId,
                )?.title ??
                item.originalFileName ??
                'تصویر مقاله',
        }))
        .filter((item) => item.src)
    return (
        <FormDialog
            isOpen
            title={title}
            width={600}
            onClose={() => onFinish(null)}
        >
            <FormDialogBody>
                {!assets.length ? (
                    <p>{emptyMessage}</p>
                ) : (
                    <ImageSelectionGrid
                        images={options}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                )}
            </FormDialogBody>
            <FormDialogActions>
                <Button type="button" onClick={() => onFinish(null)}>
                    انصراف
                </Button>
                <Button
                    type="button"
                    variant="solid"
                    disabled={!image?.path}
                    onClick={() => {
                        if (!image?.path) return
                        const translation = image.translations.find(
                            (item) => item.languageId === languageId,
                        )
                        onFinish({
                            mediaId: image.id,
                            src: `/api/public/media/${image.path}`,
                            alt: translation?.altText ?? '',
                            title: translation?.title ?? undefined,
                        })
                    }}
                >
                    افزودن به متن
                </Button>
            </FormDialogActions>
        </FormDialog>
    )
}
