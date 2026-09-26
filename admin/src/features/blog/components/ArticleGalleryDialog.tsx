import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ScopedMediaPicker } from '@/features/catalog'
import type { MediaAsset } from '@/features/media'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import Button from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { apiClient } from '@/lib/http/api-client'
import { blogApi } from '../blog.api'
import { articleDetailOptions, blogKeys } from '../blog.queries'
import { articleMediaAssets } from '../blog.media'

type Props = { articleId: string; onClose: () => void; onSaved: () => void }
export default function ArticleGalleryDialog({
    articleId,
    onClose,
    onSaved,
}: Props) {
    const client = useQueryClient()
    const detail = useQuery(articleDetailOptions(articleId))
    const [coverId, setCoverId] = useState('')
    const [busy, setBusy] = useState(false)
    const [deleting, setDeleting] = useState<MediaAsset | null>(null)
    const current = useRef(detail.data)
    current.current = detail.data
    useEffect(() => {
        setCoverId(detail.data?.coverMediaId ?? '')
    }, [detail.data?.coverMediaId])
    const save = useMutation({
        mutationFn: () =>
            blogApi.saveGallery(
                articleId,
                detail.data?.media.map((item) => item.mediaId) ?? [],
                coverId || null,
            ),
        onSuccess: (article) => {
            client.setQueryData(blogKeys.article(articleId), article)
            onSaved()
            onClose()
        },
    })
    const remove = useMutation({
        mutationFn: (asset: MediaAsset) =>
            blogApi.deleteImage(articleId, asset.id),
        meta: { suppressGlobalSuccess: true },
        onSuccess: async (result) => {
            if (result.removedFromStorage)
                toast.success('تصویر برای همیشه حذف شد.')
            else
                toast.warning(
                    'تصویر از گالری حذف شد، اما پاکسازی فایل کامل نشد.',
                )
            setDeleting(null)
            await client.invalidateQueries({
                queryKey: blogKeys.article(articleId),
            })
            onSaved()
        },
    })
    const pending = busy || save.isPending || remove.isPending
    const uploaded = async (asset: MediaAsset) => {
        const article = current.current
        if (!article) throw new Error('اطلاعات مقاله آماده نیست.')
        try {
            const updated = await blogApi.saveGallery(
                articleId,
                [...article.media.map((item) => item.mediaId), asset.id],
                coverId || article.coverMediaId || asset.id,
            )
            current.current = updated
            client.setQueryData(blogKeys.article(articleId), updated)
            onSaved()
        } catch (error) {
            // A linked image is protected by the media API if an attachment response was lost.
            await apiClient.delete(`media/${asset.id}`).catch(() => undefined)
            await client.invalidateQueries({
                queryKey: blogKeys.article(articleId),
            })
            throw error
        }
    }
    return (
        <FormDialog
            isOpen
            isPending={pending}
            title="گالری مقاله"
            width={920}
            onClose={onClose}
        >
            <Form
                onSubmit={(event) => {
                    event.preventDefault()
                    if (!pending && detail.data) save.mutate()
                }}
            >
                <FormDialogBody>
                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                        تصاویر پس از بارگذاری به همین مقاله اضافه میشوند. روی
                        تصویر برای پیش نمایش بزنید؛ حذف فایل فقط پس از تایید
                        انجام میشود.
                    </p>
                    {detail.isPending ? (
                        <Loading loading className="min-h-40" />
                    ) : detail.isError ? (
                        <QueryErrorState
                            error={detail.error}
                            title="دریافت گالری با خطا مواجه شد."
                            onRetry={() => void detail.refetch()}
                        />
                    ) : (
                        <ScopedMediaPicker
                            allowVideos={false}
                            assets={articleMediaAssets(detail.data)}
                            selectedIds={detail.data.media.map(
                                (item) => item.mediaId,
                            )}
                            primaryId={coverId}
                            onPrimaryChange={setCoverId}
                            onChange={() => undefined}
                            onRemove={setDeleting}
                            onBusyChange={setBusy}
                            onUploaded={uploaded}
                            onAssetUpdated={() =>
                                void client.invalidateQueries({
                                    queryKey: blogKeys.article(articleId),
                                })
                            }
                        />
                    )}
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" disabled={pending} onClick={onClose}>
                        بستن
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        loading={save.isPending}
                        disabled={pending || !detail.data}
                    >
                        ذخیره تصویر شاخص
                    </Button>
                </FormDialogActions>
            </Form>
            <ConfirmDialog
                isOpen={Boolean(deleting)}
                title="حذف دائمی تصویر"
                type="danger"
                confirmText="حذف دائمی"
                confirmButtonProps={{ loading: remove.isPending }}
                cancelButtonProps={{ disabled: remove.isPending }}
                closable={!remove.isPending}
                shouldCloseOnOverlayClick={!remove.isPending}
                shouldCloseOnEsc={!remove.isPending}
                onCancel={() => {
                    if (!remove.isPending) setDeleting(null)
                }}
                onClose={() => {
                    if (!remove.isPending) setDeleting(null)
                }}
                onConfirm={() => {
                    if (deleting && !remove.isPending) remove.mutate(deleting)
                }}
            >
                این تصویر از گالری مقاله و سرور حذف شود؟ این کار قابل بازگشت
                نیست. تصویر استفاده شده در متن باید ابتدا از متن ترجمه ها
                برداشته و مقاله ذخیره شود.
            </ConfirmDialog>
        </FormDialog>
    )
}
