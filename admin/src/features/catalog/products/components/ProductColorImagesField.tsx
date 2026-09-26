import { useState } from 'react'
import Button from '@/components/ui/Button'
import FormDialog, {
    FormDialogBody,
    FormDialogActions,
} from '@/components/shared/FormDialog'
import ImageSelectionGrid from '@/components/shared/ImageSelectionGrid'
import type { MediaAsset } from '@/features/media'

type Props = {
    images: MediaAsset[]
    languageId?: string
    mediaIds: string[]
    primaryMediaId: string | null
    disabled: boolean
    onChange: (mediaIds: string[], primaryMediaId: string | null) => void
}

export default function ProductColorImagesField({
    images,
    languageId,
    mediaIds,
    primaryMediaId,
    disabled,
    onChange,
}: Props) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<string[]>([])
    const options = images
        .filter((image) => image.path)
        .map((image) => ({
            id: image.id,
            src: `/api/public/media/${image.path}`,
            label:
                image.translations.find(
                    (item) => item.languageId === languageId,
                )?.title ??
                image.originalFileName ??
                'تصویر محصول',
        }))
    return (
        <div className="mt-3 space-y-3">
            <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => {
                    setDraft(mediaIds)
                    setOpen(true)
                }}
            >
                انتخاب تصاویر این رنگ
            </Button>
            {mediaIds.length > 0 ? (
                <>
                    <p className="text-xs text-gray-500">
                        برای تعیین تصویر اصلی این رنگ، روی عکس کلیک کنید.
                    </p>
                    <ImageSelectionGrid
                        images={options.filter((image) =>
                            mediaIds.includes(image.id),
                        )}
                        selectedId={primaryMediaId}
                        selectedLabel="تصویر اصلی این رنگ"
                        unselectedLabel="انتخاب به عنوان تصویر اصلی"
                        onSelect={(id) => {
                            if (!disabled) onChange(mediaIds, id)
                        }}
                    />
                </>
            ) : (
                <p className="text-xs text-gray-500">
                    بدون تصویر: تصویر اصلی محصول نمایش داده میشود.
                </p>
            )}
            {open && (
                <FormDialog
                    isOpen
                    title="تصاویر این رنگ"
                    width={700}
                    onClose={() => setOpen(false)}
                >
                    <FormDialogBody>
                        <p className="mb-4 text-sm text-gray-500">
                            عکس های مرتبط را از گالری محصول انتخاب کنید. برداشتن
                            انتخاب، فایل را از گالری حذف نمیکند.
                        </p>
                        {options.length ? (
                            <ImageSelectionGrid
                                images={options}
                                selectedIds={draft}
                                onSelect={(id) =>
                                    setDraft((ids) =>
                                        ids.includes(id)
                                            ? ids.filter((item) => item !== id)
                                            : [...ids, id],
                                    )
                                }
                            />
                        ) : (
                            <p>ابتدا تصاویر را در گالری محصول بارگذاری کنید.</p>
                        )}
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button type="button" onClick={() => setOpen(false)}>
                            انصراف
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            onClick={() => {
                                onChange(
                                    draft,
                                    primaryMediaId &&
                                        draft.includes(primaryMediaId)
                                        ? primaryMediaId
                                        : (draft[0] ?? null),
                                )
                                setOpen(false)
                            }}
                        >
                            تایید انتخاب
                        </Button>
                    </FormDialogActions>
                </FormDialog>
            )}
        </div>
    )
}
