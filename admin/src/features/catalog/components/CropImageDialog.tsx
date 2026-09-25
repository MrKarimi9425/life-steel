import { useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'

export const MAX_CROPPED_IMAGE_SIZE = 1200

type UploadProgress = {
    percent: number
    phase: 'uploading' | 'processing'
}

type Props = {
    file: File | null
    fileIndex: number
    fileCount: number
    progress: UploadProgress | null
    onClose: () => void
    onSkip: () => void
    onCrop: (file: File) => Promise<void>
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob
                    ? resolve(blob)
                    : reject(new Error('ساخت تصویر برش خورده ممکن نشد.')),
            'image/webp',
            0.9,
        )
    })
}

export default function CropImageDialog({
    file,
    fileIndex,
    fileCount,
    progress,
    onClose,
    onSkip,
    onCrop,
}: Props) {
    const [url, setUrl] = useState('')
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [pixels, setPixels] = useState<Area | null>(null)
    const [error, setError] = useState('')
    const [preparing, setPreparing] = useState(false)

    useEffect(() => {
        if (!file) return
        const objectUrl = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => setError('')
        image.onerror = () => setError('خواندن عکس ممکن نشد.')
        image.src = objectUrl
        setUrl(objectUrl)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setPixels(null)
        setError('')
        return () => {
            image.onload = null
            image.onerror = null
            URL.revokeObjectURL(objectUrl)
        }
    }, [file])

    const submit = async () => {
        if (!file || !pixels || error || preparing || progress) return
        const outputSize = Math.min(
            MAX_CROPPED_IMAGE_SIZE,
            Math.floor(Math.min(pixels.width, pixels.height)),
        )
        if (outputSize < 1) {
            setError('کادر برش معتبر نیست.')
            return
        }
        setPreparing(true)
        try {
            const bitmap = await createImageBitmap(file)
            const canvas = document.createElement('canvas')
            canvas.width = outputSize
            canvas.height = outputSize
            const context = canvas.getContext('2d')
            if (!context) throw new Error('آماده سازی تصویر ممکن نشد.')
            context.drawImage(
                bitmap,
                pixels.x,
                pixels.y,
                pixels.width,
                pixels.height,
                0,
                0,
                outputSize,
                outputSize,
            )
            bitmap.close()
            const blob = await toBlob(canvas)
            const name = `${file.name.replace(/\.[^.]+$/, '')}.webp`
            await onCrop(new File([blob], name, { type: 'image/webp' }))
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : 'آماده سازی تصویر ممکن نشد.',
            )
        } finally {
            setPreparing(false)
        }
    }

    return (
        <FormDialog
            isOpen={file !== null}
            isPending={preparing || progress !== null}
            title="برش عکس پیش از بارگذاری"
            width={780}
            onClose={onClose}
        >
            <FormDialogBody className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    عکس {fileIndex} از {fileCount} · خروجی مربع با حداکثر ضلع ۱۲۰۰ پیکسل
                </p>
                {url && !error && (
                    <div className="relative h-[min(52vh,440px)] overflow-hidden rounded-xl bg-gray-900">
                        <Cropper
                            image={url}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={(_, area) => setPixels(area)}
                            onZoomChange={setZoom}
                        />
                    </div>
                )}
                {!error && (
                    <label className="block text-sm font-semibold">
                        بزرگ نمایی
                        <input
                            className="mt-2 w-full accent-primary"
                            max={3}
                            min={1}
                            step={0.01}
                            type="range"
                            value={zoom}
                            onChange={(event) => setZoom(Number(event.target.value))}
                        />
                    </label>
                )}
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                {progress && (
                    <div aria-live="polite" className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                            <span>{progress.phase === 'processing' ? 'در حال پردازش تصویر' : 'در حال ارسال تصویر'}</span>
                            <span>{progress.phase === 'processing' ? 'ارسال کامل شد' : `${progress.percent}٪`}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progress.percent}%` }} />
                        </div>
                    </div>
                )}
            </FormDialogBody>
            <FormDialogActions>
                <Button disabled={preparing || progress !== null} type="button" onClick={onClose}>انصراف</Button>
                {fileCount > 1 && (
                    <Button disabled={preparing || progress !== null} type="button" onClick={onSkip}>رد کردن این عکس</Button>
                )}
                <Button disabled={Boolean(error) || !pixels} loading={preparing || progress !== null} type="button" variant="solid" onClick={() => void submit()}>
                    برش و بارگذاری
                </Button>
            </FormDialogActions>
        </FormDialog>
    )
}
