import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { MediaAsset } from '@/features/media'
import CropImageDialog from './CropImageDialog'
import MediaPicker from './MediaPicker'
import MediaTranslationDialog from './MediaTranslationDialog'

type UploadProgress = {
    percent: number
    phase: 'uploading' | 'processing'
    fileName: string
}

type Props = {
    assets: MediaAsset[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
    multiple?: boolean
    primaryId?: string
    onPrimaryChange?: (id: string) => void
    onRemove?: (asset: MediaAsset) => void
    onBusyChange?: (busy: boolean) => void
    allowVideos?: boolean
    onUploaded?: (asset: MediaAsset) => Promise<void>
    onAssetUpdated?: (asset: MediaAsset) => void
}

export default function ScopedMediaPicker({
    assets,
    selectedIds,
    onChange,
    multiple = true,
    primaryId,
    onPrimaryChange,
    onRemove,
    onBusyChange,
    allowVideos = true,
    onUploaded,
    onAssetUpdated,
}: Props) {
    const imageInput = useRef<HTMLInputElement>(null)
    const videoInput = useRef<HTMLInputElement>(null)
    const selectedIdsRef = useRef(selectedIds)
    const [imageQueue, setImageQueue] = useState<File[]>([])
    const [batchSize, setBatchSize] = useState(0)
    const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null)
    const [progress, setProgress] = useState<UploadProgress | null>(null)
    const client = useQueryClient()

    useEffect(() => {
        selectedIdsRef.current = selectedIds
    }, [selectedIds])

    const upload = useMutation({
        mutationFn: async (file: File) => {
            const data = new FormData()
            data.append('file', file)
            setProgress({ fileName: file.name, percent: 0, phase: 'uploading' })
            try {
                const response = await apiClient.post<ApiResponse<MediaAsset>>(
                    file.type.startsWith('image/')
                        ? 'media/upload?imageProfile=square-max-1200'
                        : 'media/upload',
                    data,
                    {
                        onUploadProgress: (event) => {
                            if (!event.total) return
                            const percent = Math.min(
                                100,
                                Math.round((event.loaded / event.total) * 100),
                            )
                            setProgress({
                                fileName: file.name,
                                percent,
                                phase:
                                    percent === 100
                                        ? 'processing'
                                        : 'uploading',
                            })
                        },
                    },
                )
                if (!response.data.data)
                    throw new Error('پاسخ بارگذاری فایل معتبر نیست.')
                const asset = {
                    ...response.data.data,
                    variants: response.data.data.variants ?? [],
                    translations: response.data.data.translations ?? [],
                }
                await onUploaded?.(asset)
                return asset
            } finally {
                setProgress(null)
            }
        },
        onSuccess: (asset) => {
            if (!onUploaded)
                client.setQueryData<MediaAsset[]>(['media'], (current) => [
                    ...(current ?? []),
                    asset,
                ])
            const next = multiple
                ? [...selectedIdsRef.current, asset.id]
                : [asset.id]
            selectedIdsRef.current = next
            onChange(next)
            if (!primaryId && next[0]) onPrimaryChange?.(next[0])
        },
    })
    useEffect(() => {
        onBusyChange?.(upload.isPending || imageQueue.length > 0)
    }, [imageQueue.length, onBusyChange, upload.isPending])
    const selectedAssets = selectedIds
        .map((id) => assets.find((asset) => asset.id === id))
        .filter((asset): asset is MediaAsset => Boolean(asset))

    const uploadVideos = async (files: File[]) => {
        for (const file of files) {
            try {
                await upload.mutateAsync(file)
            } catch {
                break
            }
        }
    }

    return (
        <div className="space-y-4">
            <input
                ref={imageInput}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                multiple={multiple}
                type="file"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? [])
                    setBatchSize(files.length)
                    setImageQueue(files)
                    event.target.value = ''
                }}
            />
            {multiple && allowVideos && (
                <input
                    ref={videoInput}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    multiple
                    type="file"
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? [])
                        if (files.length) void uploadVideos(files)
                        event.target.value = ''
                    }}
                />
            )}
            <div className="flex flex-wrap gap-2">
                <Button
                    disabled={upload.isPending || imageQueue.length > 0}
                    type="button"
                    variant="solid"
                    onClick={() => imageInput.current?.click()}
                >
                    {multiple ? 'افزودن عکس' : 'بارگذاری تصویر'}
                </Button>
                {multiple && allowVideos && (
                    <Button
                        disabled={upload.isPending || imageQueue.length > 0}
                        type="button"
                        onClick={() => videoInput.current?.click()}
                    >
                        افزودن ویدیو
                    </Button>
                )}
            </div>
            {progress && !imageQueue.length && (
                <div
                    aria-live="polite"
                    className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                >
                    <div className="flex justify-between gap-2 text-sm">
                        <span className="truncate">{progress.fileName}</span>
                        <span>
                            {progress.phase === 'processing'
                                ? 'در حال پردازش'
                                : `${progress.percent}٪`}
                        </span>
                    </div>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                        role="progressbar"
                        aria-valuenow={progress.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-200"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                </div>
            )}
            <MediaPicker
                assets={selectedAssets}
                emptyText="هنوز فایلی برای این مورد ثبت نشده است."
                multiple={multiple}
                primaryId={primaryId}
                selectedIds={selectedIds}
                onChange={onChange}
                onPrimaryChange={onPrimaryChange}
                onEdit={setEditingAsset}
                onRemove={onRemove}
            />
            <CropImageDialog
                file={imageQueue[0] ?? null}
                fileCount={batchSize}
                fileIndex={batchSize - imageQueue.length + 1}
                progress={progress}
                onClose={() => setImageQueue([])}
                onSkip={() => setImageQueue((current) => current.slice(1))}
                onCrop={async (file) => {
                    await upload.mutateAsync(file)
                    setImageQueue((current) => current.slice(1))
                }}
            />
            <MediaTranslationDialog
                asset={editingAsset}
                onClose={() => setEditingAsset(null)}
                onSaved={onAssetUpdated}
            />
        </div>
    )
}
