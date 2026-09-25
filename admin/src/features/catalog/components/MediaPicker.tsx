import { useState } from 'react'
import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import Button from '@/components/ui/Button'
import type { MediaAsset } from '@/features/media'
import MediaPreviewDialog from './MediaPreviewDialog'

type MediaPickerProps = {
    assets: MediaAsset[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
    multiple?: boolean
    primaryId?: string
    onPrimaryChange?: (id: string) => void
    emptyText?: string
    onEdit?: (asset: MediaAsset) => void
    onRemove?: (asset: MediaAsset) => void
}

const mediaTitle = (asset: MediaAsset) =>
    asset.translations.find((item) => item.title)?.title ??
    asset.originalFileName ??
    'رسانه بدون عنوان'

const mediaUrl = (asset: MediaAsset) =>
    asset.path ? `/api/public/media/${asset.path}` : asset.externalUrl

export default function MediaPicker({
    assets,
    selectedIds,
    onChange,
    multiple = true,
    primaryId,
    onPrimaryChange,
    emptyText = 'رسانه ای برای انتخاب وجود ندارد.',
    onEdit,
    onRemove,
}: MediaPickerProps) {
    const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null)
    const remove = (asset: MediaAsset) => {
        if (onRemove) {
            onRemove(asset)
            return
        }
        onChange(selectedIds.filter((id) => id !== asset.id))
        if (primaryId === asset.id) onPrimaryChange?.('')
    }

    return (
        <>
            {assets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                    {emptyText}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {assets.map((asset) => {
                        const isPrimary = primaryId === asset.id
                        const url = mediaUrl(asset)
                        return (
                            <div
                                key={asset.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <button
                                    aria-label={`پیش نمایش ${mediaTitle(asset)}`}
                                    className="relative block aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                                    type="button"
                                    onClick={() => setPreviewAsset(asset)}
                                >
                                    {asset.kind === 'IMAGE' && url ? (
                                        <img
                                            alt={mediaTitle(asset)}
                                            className="h-full w-full object-contain"
                                            src={url}
                                        />
                                    ) : (
                                        <GalleryIcon className="m-auto h-full w-8 text-gray-400" />
                                    )}
                                    {isPrimary && (
                                        <span className="absolute bottom-2 right-2 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white">
                                            تصویر اصلی
                                        </span>
                                    )}
                                </button>
                                <p className="mt-2 truncate text-xs font-semibold" title={mediaTitle(asset)}>
                                    {mediaTitle(asset)}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {multiple && onPrimaryChange && !isPrimary && asset.kind === 'IMAGE' && (
                                        <Button size="xs" type="button" onClick={() => onPrimaryChange(asset.id)}>
                                            اصلی کردن
                                        </Button>
                                    )}
                                    {onEdit && (
                                        <Button size="xs" type="button" onClick={() => onEdit(asset)}>
                                            متن عکس
                                        </Button>
                                    )}
                                    <Button
                                        className="!border-red-200 !text-red-600 hover:!bg-red-50 dark:!border-red-800 dark:!text-red-400"
                                        size="xs"
                                        type="button"
                                        onClick={() => remove(asset)}
                                    >
                                        {onRemove ? 'حذف دائمی' : 'برداشتن تصویر'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <MediaPreviewDialog
                asset={previewAsset}
                onClose={() => setPreviewAsset(null)}
            />
        </>
    )
}
