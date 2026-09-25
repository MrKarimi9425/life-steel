import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import type { MediaAsset } from '@/features/media'
import { apiClient } from '@/lib/http/api-client'
import ScopedMediaPicker from '../../components/ScopedMediaPicker'
import { productsApi } from '../products.api'

type Props = {
    isOpen: boolean
    productId: string | null
    assets: MediaAsset[]
    mediaError: unknown
    mediaLoading: boolean
    onClose: () => void
    onSaved: () => void
    onRetryMedia: () => void
}

export default function ProductMediaDialog({
    isOpen,
    productId,
    assets,
    mediaError,
    mediaLoading,
    onClose,
    onSaved,
    onRetryMedia,
}: Props) {
    const [mediaIds, setMediaIds] = useState<string[]>([])
    const [coverMediaId, setCoverMediaId] = useState('')
    const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null)
    const [mediaBusy, setMediaBusy] = useState(false)
    const hasPersistedDeletion = useRef(false)
    const client = useQueryClient()
    const detailQuery = useQuery({
        queryKey: ['catalog', 'product', productId],
        queryFn: () => productsApi.detail(productId as string),
        enabled: isOpen && Boolean(productId),
    })
    useEffect(() => {
        if (!detailQuery.data) return
        setMediaIds(detailQuery.data.media.map((item) => item.mediaId))
        setCoverMediaId(detailQuery.data.coverMediaId ?? '')
    }, [detailQuery.data])
    const saveMutation = useMutation({
        mutationFn: () =>
            productsApi.updateMedia(
                productId as string,
                mediaIds,
                coverMediaId,
            ),
        onSuccess: () => {
            hasPersistedDeletion.current = false
            onSaved()
            onClose()
        },
    })
    const deleteMutation = useMutation({
        mutationFn: async (asset: MediaAsset) => {
            const persisted =
                detailQuery.data?.media.some(
                    (item) => item.mediaId === asset.id,
                ) || detailQuery.data?.coverMediaId === asset.id
            if (persisted) {
                const response = await productsApi.deleteMedia(
                    productId as string,
                    asset.id,
                )
                return {
                    removedFromStorage: response.data.data?.removedFromStorage ?? false,
                    persisted: true,
                }
            }
            await apiClient.delete(`media/${asset.id}`)
            return { removedFromStorage: true, persisted: false }
        },
        onSuccess: ({ removedFromStorage, persisted }, asset) => {
            const nextIds = mediaIds.filter((id) => id !== asset.id)
            setMediaIds(nextIds)
            if (coverMediaId === asset.id) {
                setCoverMediaId(
                    assets.find(
                        (item) =>
                            nextIds.includes(item.id) && item.kind === 'IMAGE',
                    )?.id ?? '',
                )
            }
            if (removedFromStorage) {
                client.setQueryData<MediaAsset[]>(['media'], (current) =>
                    (current ?? []).filter((item) => item.id !== asset.id),
                )
            }
            if (persisted) hasPersistedDeletion.current = true
            setDeletingAsset(null)
        },
    })
    const close = () => {
        if (mediaBusy || deleteMutation.isPending) return
        if (hasPersistedDeletion.current) {
            hasPersistedDeletion.current = false
            onSaved()
        }
        onClose()
    }
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (
            mediaLoading ||
            mediaError ||
            detailQuery.isPending ||
            detailQuery.isError
        )
            return
        saveMutation.mutate()
    }

    return (
        <FormDialog
            isOpen={isOpen}
            isPending={
                mediaBusy || saveMutation.isPending || deleteMutation.isPending
            }
            title="تصاویر و گالری محصول"
            width={920}
            onClose={close}
        >
            <Form onSubmit={submit}>
                <FormDialogBody>
                    <div className="mb-4">
                        <h5>رسانه های محصول</h5>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            روی عکس برای پیش نمایش بزنید. حذف فایل تنها پس از
                            تایید انجام می شود.
                        </p>
                    </div>
                    {mediaLoading || detailQuery.isPending ? (
                        <Loading className="min-h-40" loading />
                    ) : mediaError ? (
                        <QueryErrorState
                            error={mediaError}
                            title="دریافت رسانه ها با خطا مواجه شد."
                            onRetry={onRetryMedia}
                        />
                    ) : detailQuery.isError ? (
                        <QueryErrorState
                            error={detailQuery.error}
                            title="دریافت محصول با خطا مواجه شد."
                            onRetry={() => void detailQuery.refetch()}
                        />
                    ) : (
                        <ScopedMediaPicker
                            assets={assets}
                            primaryId={coverMediaId}
                            selectedIds={mediaIds}
                            onChange={(nextIds) => {
                                setMediaIds(nextIds)
                                if (!nextIds.includes(coverMediaId))
                                    setCoverMediaId('')
                            }}
                            onPrimaryChange={setCoverMediaId}
                            onRemove={setDeletingAsset}
                            onBusyChange={setMediaBusy}
                        />
                    )}
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" onClick={close}>
                        انصراف
                    </Button>
                    <Button
                        disabled={
                            mediaBusy ||
                            deleteMutation.isPending ||
                            mediaLoading ||
                            Boolean(mediaError) ||
                            detailQuery.isPending ||
                            detailQuery.isError
                        }
                        loading={saveMutation.isPending}
                        type="submit"
                        variant="solid"
                    >
                        ذخیره تصاویر
                    </Button>
                </FormDialogActions>
            </Form>
            <ConfirmDialog
                isOpen={deletingAsset !== null}
                title="حذف دائمی فایل"
                type="danger"
                confirmText="حذف دائمی"
                confirmButtonProps={{ loading: deleteMutation.isPending }}
                onCancel={() => setDeletingAsset(null)}
                onClose={() => setDeletingAsset(null)}
                onConfirm={() => {
                    if (deletingAsset) deleteMutation.mutate(deletingAsset)
                }}
            >
                این فایل از گالری محصول و از سرور حذف شود؟ این کار قابل بازگشت
                نیست.
            </ConfirmDialog>
        </FormDialog>
    )
}
