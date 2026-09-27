import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ScopedMediaPicker } from '@/features/catalog'
import type { MediaAsset } from '@/features/media'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { apiClient } from '@/lib/http/api-client'
import { siteContentApi, siteKeys } from '../site-content.api'
import SiteDeleteDialog from './SiteDeleteDialog'
export default function AboutGalleryDialog({
    onClose,
}: {
    onClose: () => void
}) {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.about,
        queryFn: siteContentApi.about,
    })
    const current = useRef(query.data)
    current.current = query.data
    const [busy, setBusy] = useState(false)
    const [deleting, setDeleting] = useState<MediaAsset | null>(null)
    const remove = useMutation({
        mutationFn: (asset: MediaAsset) => siteContentApi.removeImage(asset.id),
        meta: { suppressGlobalSuccess: true },
        onSuccess: (result) => {
            if (result.removedFromStorage)
                toast.success('تصویر برای همیشه حذف شد.')
            else
                toast.warning(
                    'تصویر از گالری حذف شد، اما فایل هنوز در حال استفاده است.',
                )
            setDeleting(null)
            void client.invalidateQueries({ queryKey: siteKeys.about })
        },
    })
    const uploaded = async (asset: MediaAsset) => {
        try {
            const updated = await siteContentApi.gallery([
                ...(current.current?.media.map((m) => m.mediaId) ?? []),
                asset.id,
            ])
            current.current = updated
            client.setQueryData(siteKeys.about, updated)
        } catch (error) {
            await apiClient.delete(`media/${asset.id}`).catch(() => undefined)
            await client.invalidateQueries({ queryKey: siteKeys.about })
            throw error
        }
    }
    return (
        <FormDialog
            isOpen
            title="گالری درباره ما"
            width={920}
            isPending={busy || remove.isPending}
            onClose={onClose}
        >
            <FormDialogBody>
                <p className="mb-4 text-sm text-gray-500">
                    این تصاویر فقط برای صفحه درباره ما هستند. حذف فایل استفاده
                    شده در متن، پس از حذف آن از متن و ذخیره صفحه ممکن است.
                </p>
                {query.isPending ? (
                    <Loading loading />
                ) : query.isError ? (
                    <QueryErrorState
                        error={query.error}
                        title="دریافت گالری ناموفق بود."
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <ScopedMediaPicker
                        allowVideos={false}
                        assets={query.data.media.map((m) => m.media)}
                        selectedIds={query.data.media.map((m) => m.mediaId)}
                        onChange={() => undefined}
                        onRemove={setDeleting}
                        onBusyChange={setBusy}
                        onUploaded={uploaded}
                        onAssetUpdated={() =>
                            void client.invalidateQueries({
                                queryKey: siteKeys.about,
                            })
                        }
                    />
                )}
            </FormDialogBody>
            <FormDialogActions>
                <Button disabled={busy || remove.isPending} onClick={onClose}>
                    بستن
                </Button>
            </FormDialogActions>
            {deleting && (
                <SiteDeleteDialog
                    title="تصویر گالری"
                    pending={remove.isPending}
                    onClose={() => {
                        if (!remove.isPending) setDeleting(null)
                    }}
                    onConfirm={() => {
                        if (!remove.isPending) remove.mutate(deleting)
                    }}
                />
            )}
        </FormDialog>
    )
}
