import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import ListPageLayout from '@/components/shared/ListPageLayout'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '@/features/languages'
import type { MediaAsset } from '@/features/media'
import { useListReorder } from '@/hooks/useListReorder'
import { LanguageTabs } from '../components/LanguageTabs'
import ScopedMediaPicker from '../components/ScopedMediaPicker'
import type { Category, Translation } from '../types'

type CategoryForm = {
    isActive: boolean
    imageId: string
    translations: Translation[]
}

const categoriesQueryKey = ['catalog', 'categories'] as const

const emptyTranslation = (languageId: string): Translation => ({
    languageId,
    title: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
})

export function CategoriesPage() {
    const client = useQueryClient()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [mediaBusy, setMediaBusy] = useState(false)
    const [removeId, setRemoveId] = useState<string | null>(null)
    const [activeLanguageId, setActiveLanguageId] = useState('')
    const [form, setForm] = useState<CategoryForm>({
        isActive: true,
        imageId: '',
        translations: [],
    })
    const languagesQuery = useQuery({
        queryKey: ['languages'],
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Language[]>>('languages')).data
                .data ?? [],
    })
    const languages = useMemo(
        () => (languagesQuery.data ?? []).filter((item) => item.isActive),
        [languagesQuery.data],
    )
    const categories = useQuery({
        queryKey: categoriesQueryKey,
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Category[]>>('catalog/categories'))
                .data.data ?? [],
    })
    const media = useQuery({
        queryKey: ['media'],
        enabled: open,
        queryFn: async () =>
            (await apiClient.get<ApiResponse<MediaAsset[]>>('media')).data
                .data ?? [],
    })
    useEffect(() => {
        if (!activeLanguageId && languages[0])
            setActiveLanguageId(languages[0].id)
    }, [activeLanguageId, languages])
    const refresh = () =>
        client.invalidateQueries({ queryKey: categoriesQueryKey })
    const reorder = useListReorder<Category>(
        categoriesQueryKey,
        'catalog/categories/order',
    )
    const save = useMutation({
        mutationFn: () => {
            const payload = {
                ...form,
                imageId: form.imageId || undefined,
                translations: form.translations.filter(
                    (item) => item.title.trim() && item.slug.trim(),
                ),
            }
            return editingId
                ? apiClient.patch(`catalog/categories/${editingId}`, payload)
                : apiClient.post('catalog/categories', payload)
        },
        onSuccess: () => {
            setOpen(false)
            void refresh()
        },
    })
    const remove = useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(`catalog/categories/${id}`),
        onSuccess: () => void refresh(),
    })

    const beginCreate = () => {
        setEditingId(null)
        setForm({
            isActive: true,
            imageId: '',
            translations: languages.map((language) =>
                emptyTranslation(language.id),
            ),
        })
        setActiveLanguageId(languages[0]?.id ?? '')
        setOpen(true)
    }
    const beginEdit = (category: Category) => {
        setEditingId(category.id)
        setForm({
            isActive: category.isActive,
            imageId: category.imageId ?? '',
            translations: languages.map((language) => {
                const translation = category.translations.find(
                    (item) => item.languageId === language.id,
                )
                return translation
                    ? {
                          languageId: language.id,
                          title: translation.title ?? '',
                          slug: translation.slug ?? '',
                          description: translation.description ?? '',
                          seoTitle: translation.seoTitle ?? '',
                          seoDescription: translation.seoDescription ?? '',
                      }
                    : emptyTranslation(language.id)
            }),
        })
        setActiveLanguageId(languages[0]?.id ?? '')
        setOpen(true)
    }
    const updateTranslation = (patch: Partial<Translation>) =>
        setForm((current) => ({
            ...current,
            translations: current.translations.map((translation) =>
                translation.languageId === activeLanguageId
                    ? { ...translation, ...patch }
                    : translation,
            ),
        }))
    const currentTranslation = form.translations.find(
        (item) => item.languageId === activeLanguageId,
    )
    const isPersian = languages.some(
        (language) =>
            language.id === activeLanguageId && language.code === 'fa',
    )
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (mediaBusy || media.isPending || media.isError) return
        save.mutate()
    }
    const title = (category: Category) =>
        category.translations.find(
            (item) =>
                languagesQuery.data?.find((language) => language.isDefault)
                    ?.id === item.languageId,
        )?.title ??
        category.translations[0]?.title ??
        'بدون عنوان'
    const columns: ColumnDef<Category>[] = [
        {
            header: 'عنوان',
            id: 'title',
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {title(row.original)}
                </span>
            ),
        },
        {
            header: 'وضعیت',
            accessorKey: 'isActive',
            cell: ({ row }) => (
                <Tag>{row.original.isActive ? 'فعال' : 'غیر فعال'}</Tag>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <TableActions>
                    <TableActionButton
                        icon={<EditIcon height={18} width={18} />}
                        label="ویرایش"
                        tone="edit"
                        onClick={() => beginEdit(row.original)}
                    />
                    <TableActionButton
                        icon={<TrashIcon height={18} width={18} />}
                        label="حذف"
                        tone="danger"
                        onClick={() => setRemoveId(row.original.id)}
                    />
                </TableActions>
            ),
        },
    ]

    return (
        <>
            <ListPageLayout
                title="دسته بندی محصولات"
                subtitle="دسته بندی های یک سطحی و چند زبانه کاتالوگ"
                actions={
                    <Button
                        icon={<AddIcon height={20} width={20} />}
                        variant="solid"
                        onClick={beginCreate}
                    >
                        دسته بندی جدید
                    </Button>
                }
            >
                {categories.isError ? (
                    <QueryErrorState
                        error={categories.error}
                        title="دریافت دسته بندی ها با خطا مواجه شد."
                        onRetry={() => void categories.refetch()}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        customNoDataIcon={<TableEmptyStateIcon />}
                        data={categories.data ?? []}
                        dragDisabled={reorder.isPending}
                        draggable
                        getRowId={(category) => category.id}
                        loading={categories.isPending}
                        paginate={false}
                        onReorder={(items) => reorder.mutate(items)}
                    />
                )}
            </ListPageLayout>
            <ConfirmDialog
                isOpen={removeId !== null}
                title="حذف دسته بندی"
                type="danger"
                confirmText="حذف"
                confirmButtonProps={{ loading: remove.isPending }}
                onCancel={() => setRemoveId(null)}
                onClose={() => setRemoveId(null)}
                onConfirm={() => {
                    if (!removeId) return
                    remove.mutate(removeId, {
                        onSuccess: () => setRemoveId(null),
                    })
                }}
            >
                این دسته بندی حذف شود؟
            </ConfirmDialog>
            <FormDialog
                isOpen={open}
                isPending={mediaBusy || save.isPending}
                title={editingId ? 'ویرایش دسته بندی' : 'دسته بندی جدید'}
                width={760}
                onClose={() => setOpen(false)}
            >
                <Form onSubmit={submit}>
                    <FormDialogBody className="space-y-4">
                        <LanguageTabs
                            languages={languages}
                            activeId={activeLanguageId}
                            onChange={setActiveLanguageId}
                        >
                            {currentTranslation && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormItem
                                            asterisk={isPersian}
                                            label="عنوان"
                                        >
                                            <Input
                                                dir={isPersian ? 'rtl' : 'ltr'}
                                                value={currentTranslation.title}
                                                onChange={(event) =>
                                                    updateTranslation({
                                                        title: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                        <FormItem
                                            asterisk={isPersian}
                                            label="شناسه صفحه"
                                        >
                                            <Input
                                                dir="ltr"
                                                placeholder="slug"
                                                value={currentTranslation.slug}
                                                onChange={(event) =>
                                                    updateTranslation({
                                                        slug: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                    </div>
                                    <FormItem label="توضیحات">
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            textArea
                                            rows={4}
                                            value={
                                                currentTranslation.description
                                            }
                                            onChange={(event) =>
                                                updateTranslation({
                                                    description:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </FormItem>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormItem label="عنوان SEO">
                                            <Input
                                                dir={isPersian ? 'rtl' : 'ltr'}
                                                value={
                                                    currentTranslation.seoTitle
                                                }
                                                onChange={(event) =>
                                                    updateTranslation({
                                                        seoTitle:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                        <FormItem label="توضیحات SEO">
                                            <Input
                                                dir={isPersian ? 'rtl' : 'ltr'}
                                                value={
                                                    currentTranslation.seoDescription
                                                }
                                                onChange={(event) =>
                                                    updateTranslation({
                                                        seoDescription:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                    </div>
                                </div>
                            )}
                        </LanguageTabs>
                        <div>
                            <Checkbox
                                checked={form.isActive}
                                onChange={(checked) =>
                                    setForm({ ...form, isActive: checked })
                                }
                            >
                                فعال
                            </Checkbox>
                        </div>
                        <section>
                            <div className="mb-3">
                                <h5>تصویر دسته بندی</h5>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    تصویر دسته بندی را اینجا بارگذاری کنید.
                                </p>
                            </div>
                            {media.isPending ? (
                                <Loading className="min-h-28" loading />
                            ) : media.isError ? (
                                <QueryErrorState
                                    error={media.error}
                                    title="دریافت تصاویر با خطا مواجه شد."
                                    onRetry={() => void media.refetch()}
                                />
                            ) : (
                                <ScopedMediaPicker
                                    assets={(media.data ?? []).filter(
                                        (asset) => asset.kind === 'IMAGE',
                                    )}
                                    multiple={false}
                                    selectedIds={
                                        form.imageId ? [form.imageId] : []
                                    }
                                    onChange={(ids) =>
                                        setForm({
                                            ...form,
                                            imageId: ids[0] ?? '',
                                        })
                                    }
                                    onBusyChange={setMediaBusy}
                                />
                            )}
                        </section>
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button type="button" onClick={() => setOpen(false)}>
                            انصراف
                        </Button>
                        <Button
                            disabled={
                                mediaBusy || media.isPending || media.isError
                            }
                            loading={save.isPending}
                            type="submit"
                            variant="solid"
                        >
                            ذخیره
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormDialog>
        </>
    )
}
