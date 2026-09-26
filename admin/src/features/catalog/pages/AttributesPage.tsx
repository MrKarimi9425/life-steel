import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import ColorPicker from '@/components/shared/ColorPicker'
import Select from '@/components/ui/Select'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import DataList from '@/components/shared/DataList'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import RelationMultiSelect from '@/components/shared/RelationMultiSelect'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '@/features/languages'
import { useListReorder } from '@/hooks/useListReorder'
import { LanguageTabs } from '../components/LanguageTabs'
import type { AttributeDefinition, Category } from '../types'

const selectableTypes = new Set(['SINGLE_SELECT', 'MULTI_SELECT', 'COLOR'])
const typeLabels: Record<string, string> = {
    SHORT_TEXT: 'متن کوتاه',
    LONG_TEXT: 'متن بلند',
    NUMBER: 'عدد',
    BOOLEAN: 'بله یا خیر',
    SINGLE_SELECT: 'انتخاب تکی',
    MULTI_SELECT: 'انتخاب چندتایی',
    COLOR: 'رنگ',
}

type AttributeForm = {
    type: string
    isFilterable: boolean
    isVisible: boolean
    isActive: boolean
    allowCustomValue: boolean
    translations: Array<{
        languageId: string
        name: string
        description: string
        unitLabel: string
    }>
    categories: Array<{
        categoryId: string
        isRequired: boolean
        displayOrder: number
    }>
    options: Array<{
        id?: string
        colorHex: string
        isActive: boolean
        displayOrder: number
        translations: Array<{ languageId: string; label: string }>
    }>
}

const makeForm = (languages: Language[]): AttributeForm => ({
    type: 'SHORT_TEXT',
    isFilterable: false,
    isVisible: true,
    isActive: true,
    allowCustomValue: false,
    translations: languages.map((language) => ({
        languageId: language.id,
        name: '',
        description: '',
        unitLabel: '',
    })),
    categories: [],
    options: [],
})

const attributesQueryKey = ['catalog', 'attributes'] as const

export function AttributesPage() {
    const client = useQueryClient()
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [activeLanguageId, setActiveLanguageId] = useState('')
    const [form, setForm] = useState<AttributeForm>(() => makeForm([]))
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
    const categoriesQuery = useQuery({
        queryKey: ['catalog', 'categories'],
        enabled: open,
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Category[]>>('catalog/categories'))
                .data.data ?? [],
    })
    const attributes = useQuery({
        queryKey: attributesQueryKey,
        queryFn: async () =>
            (
                await apiClient.get<ApiResponse<AttributeDefinition[]>>(
                    'catalog/attributes',
                )
            ).data.data ?? [],
    })
    useEffect(() => {
        if (!activeLanguageId && languages[0])
            setActiveLanguageId(languages[0].id)
    }, [activeLanguageId, languages])
    const refresh = () =>
        client.invalidateQueries({ queryKey: attributesQueryKey })
    const reorder = useListReorder<AttributeDefinition>(
        attributesQueryKey,
        'catalog/attributes/order',
    )
    const save = useMutation({
        mutationFn: () => {
            const payload = {
                ...form,
                translations: form.translations.filter((item) =>
                    item.name.trim(),
                ),
                options: form.options.map((option) => ({
                    ...option,
                    colorHex: option.colorHex || undefined,
                    translations: option.translations.filter((item) =>
                        item.label.trim(),
                    ),
                })),
            }
            return editingId
                ? apiClient.patch(`catalog/attributes/${editingId}`, payload)
                : apiClient.post('catalog/attributes', payload)
        },
        onSuccess: () => {
            setOpen(false)
            void refresh()
        },
    })
    const categoryTitle = (category: Category) =>
        category.translations.find(
            (translation) =>
                languagesQuery.data?.find((language) => language.isDefault)
                    ?.id === translation.languageId,
        )?.title ?? category.translations[0]?.title
    const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: categoryTitle(category) ?? 'دسته بندی بدون عنوان',
        description: category.isActive ? 'فعال' : 'غیرفعال',
    }))
    const beginCreate = () => {
        setEditingId(null)
        setForm(makeForm(languages))
        setActiveLanguageId(languages[0]?.id ?? '')
        setOpen(true)
    }
    const beginEdit = (attribute: AttributeDefinition) => {
        setEditingId(attribute.id)
        setForm({
            type: attribute.type,
            isFilterable: attribute.isFilterable,
            isVisible: attribute.isVisible,
            isActive: attribute.isActive,
            allowCustomValue: attribute.allowCustomValue,
            translations: languages.map((language) => {
                const current = attribute.translations.find(
                    (item) => item.languageId === language.id,
                )
                return {
                    languageId: language.id,
                    name: current?.name ?? '',
                    description: current?.description ?? '',
                    unitLabel: current?.unitLabel ?? '',
                }
            }),
            options: attribute.options.map((option) => ({
                id: option.id,
                colorHex: option.colorHex ?? '',
                isActive: option.isActive,
                displayOrder: option.displayOrder,
                translations: languages.map((language) => ({
                    languageId: language.id,
                    label:
                        option.translations.find(
                            (item) => item.languageId === language.id,
                        )?.label ?? '',
                })),
            })),
            categories: attribute.categories.map((category) => ({
                categoryId: category.categoryId,
                isRequired: category.isRequired,
                displayOrder: category.displayOrder,
            })),
        })
        setActiveLanguageId(languages[0]?.id ?? '')
        setOpen(true)
    }
    const currentTranslation = form.translations.find(
        (item) => item.languageId === activeLanguageId,
    )
    const isPersian = languages.some(
        (language) =>
            language.id === activeLanguageId && language.code === 'fa',
    )
    const updateTranslation = (
        patch: Partial<NonNullable<typeof currentTranslation>>,
    ) =>
        setForm((current) => ({
            ...current,
            translations: current.translations.map((item) =>
                item.languageId === activeLanguageId
                    ? { ...item, ...patch }
                    : item,
            ),
        }))
    const addOption = () =>
        setForm((current) => ({
            ...current,
            options: [
                ...current.options,
                {
                    colorHex: '',
                    isActive: true,
                    displayOrder: current.options.length,
                    translations: languages.map((language) => ({
                        languageId: language.id,
                        label: '',
                    })),
                },
            ],
        }))
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (categoriesQuery.isPending || categoriesQuery.isError) return
        save.mutate()
    }
    const columns: ColumnDef<AttributeDefinition>[] = [
        {
            header: 'نام',
            id: 'name',
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {row.original.translations.find(
                        (item) =>
                            item.languageId ===
                            languagesQuery.data?.find(
                                (language) => language.isDefault,
                            )?.id,
                    )?.name ?? row.original.translations[0]?.name}
                </span>
            ),
        },
        {
            header: 'نوع',
            accessorKey: 'type',
            cell: ({ row }) => typeLabels[row.original.type],
        },
        {
            header: 'فیلتر',
            accessorKey: 'isFilterable',
            cell: ({ row }) => (
                <Tag>{row.original.isFilterable ? 'بله' : 'خیر'}</Tag>
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
                </TableActions>
            ),
        },
    ]

    return (
        <>
            <ListPageLayout
                title="ویژگی های محصولات"
                subtitle="تعریف ویژگی، گزینه ها و اتصال به دسته بندی ها"
                actions={
                    <Button
                        icon={<AddIcon height={20} width={20} />}
                        variant="solid"
                        onClick={beginCreate}
                    >
                        ویژگی جدید
                    </Button>
                }
            >
                {attributes.isError ? (
                    <QueryErrorState
                        error={attributes.error}
                        title="دریافت ویژگی ها با خطا مواجه شد."
                        onRetry={() => void attributes.refetch()}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        customNoDataIcon={<TableEmptyStateIcon />}
                        data={attributes.data ?? []}
                        dragDisabled={reorder.isPending}
                        draggable
                        getRowId={(attribute) => attribute.id}
                        loading={attributes.isPending}
                        paginate={false}
                        onReorder={(items) => reorder.mutate(items)}
                    />
                )}
            </ListPageLayout>
            <FormDialog
                isOpen={open}
                title={editingId ? 'ویرایش ویژگی' : 'ویژگی جدید'}
                width={900}
                onClose={() => setOpen(false)}
            >
                <Form onSubmit={submit}>
                    <FormDialogBody className="space-y-5">
                        {categoriesQuery.isError && (
                            <QueryErrorState
                                error={categoriesQuery.error}
                                title="دریافت دسته بندی ها با خطا مواجه شد."
                                onRetry={() => void categoriesQuery.refetch()}
                            />
                        )}
                        <div>
                            <FormItem label="نوع ویژگی">
                                <Select
                                    isSearchable={false}
                                    options={Object.entries(typeLabels).map(
                                        ([value, label]) => ({ value, label }),
                                    )}
                                    value={{
                                        value: form.type,
                                        label:
                                            typeLabels[form.type] ?? form.type,
                                    }}
                                    onChange={(option) =>
                                        setForm({
                                            ...form,
                                            type: option?.value ?? form.type,
                                        })
                                    }
                                />
                            </FormItem>
                        </div>
                        <LanguageTabs
                            languages={languages}
                            activeId={activeLanguageId}
                            onChange={setActiveLanguageId}
                        >
                            {currentTranslation && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormItem
                                        asterisk={isPersian}
                                        label="نام ویژگی"
                                    >
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            value={currentTranslation.name}
                                            onChange={(event) =>
                                                updateTranslation({
                                                    name: event.target.value,
                                                })
                                            }
                                        />
                                    </FormItem>
                                    <FormItem label="واحد">
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            placeholder="مانند سانتی متر"
                                            value={currentTranslation.unitLabel}
                                            onChange={(event) =>
                                                updateTranslation({
                                                    unitLabel:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </FormItem>
                                    <FormItem
                                        className="sm:col-span-2"
                                        label="توضیح"
                                    >
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            textArea
                                            rows={3}
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
                                </div>
                            )}
                        </LanguageTabs>
                        <div className="flex flex-wrap gap-4">
                            <Checkbox
                                checked={form.isFilterable}
                                onChange={(checked) =>
                                    setForm({ ...form, isFilterable: checked })
                                }
                            >
                                قابل فیلتر
                            </Checkbox>
                            <Checkbox
                                checked={form.isVisible}
                                onChange={(checked) =>
                                    setForm({ ...form, isVisible: checked })
                                }
                            >
                                نمایش در سایت
                            </Checkbox>
                            <Checkbox
                                checked={form.allowCustomValue}
                                onChange={(checked) =>
                                    setForm({
                                        ...form,
                                        allowCustomValue: checked,
                                    })
                                }
                            >
                                مقدار اختصاصی
                            </Checkbox>
                        </div>
                        <section>
                            <div className="mb-3">
                                <h5>دسته بندی های مرتبط</h5>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    مشخص کنید این ویژگی برای کدام دسته بندی ها
                                    نمایش داده شود. تنظیمات هر دسته بعد از
                                    انتخاب در پایین قابل تغییر است.
                                </p>
                            </div>
                            <RelationMultiSelect
                                isLoading={categoriesQuery.isPending}
                                options={categoryOptions}
                                placeholder="جستجو و انتخاب دسته بندی"
                                value={form.categories.map(
                                    (item) => item.categoryId,
                                )}
                                onChange={(categoryIds) =>
                                    setForm((current) => ({
                                        ...current,
                                        categories: categoryIds.map(
                                            (categoryId, index) =>
                                                current.categories.find(
                                                    (item) =>
                                                        item.categoryId ===
                                                        categoryId,
                                                ) ?? {
                                                    categoryId,
                                                    isRequired: false,
                                                    displayOrder: index,
                                                },
                                        ),
                                    }))
                                }
                            />
                            {form.categories.length > 0 && (
                                <div className="mt-3 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
                                    <DataList
                                        draggable
                                        columns={[
                                            {
                                                id: 'category',
                                                className: 'min-w-0 flex-1',
                                                render: (relation) => {
                                                    const category =
                                                        categoriesQuery.data?.find(
                                                            (item) =>
                                                                item.id ===
                                                                relation.categoryId,
                                                        )
                                                    return (
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {category
                                                                    ? categoryTitle(
                                                                          category,
                                                                      )
                                                                    : 'دسته بندی حذف شده'}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                تنظیمات نمایش
                                                                ویژگی در این
                                                                دسته
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                            },
                                            {
                                                id: 'required',
                                                render: (relation) => (
                                                    <Checkbox
                                                        checked={
                                                            relation.isRequired
                                                        }
                                                        onChange={(checked) =>
                                                            setForm(
                                                                (current) => ({
                                                                    ...current,
                                                                    categories:
                                                                        current.categories.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.categoryId ===
                                                                                relation.categoryId
                                                                                    ? {
                                                                                          ...item,
                                                                                          isRequired:
                                                                                              checked,
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        اجباری
                                                    </Checkbox>
                                                ),
                                            },
                                        ]}
                                        data={form.categories}
                                        getRowId={(item) => item.categoryId}
                                        onReorder={(items) =>
                                            setForm((current) => ({
                                                ...current,
                                                categories: items.map(
                                                    (item, displayOrder) => ({
                                                        ...item,
                                                        displayOrder,
                                                    }),
                                                ),
                                            }))
                                        }
                                    />
                                </div>
                            )}
                        </section>
                        {selectableTypes.has(form.type) && (
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <h5>گزینه ها</h5>
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={addOption}
                                    >
                                        افزودن گزینه
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.options.map((option, index) => (
                                        <div
                                            key={option.id ?? index}
                                            className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
                                        >
                                            <FormItem label="عنوان گزینه">
                                                <Input
                                                    dir={
                                                        isPersian
                                                            ? 'rtl'
                                                            : 'ltr'
                                                    }
                                                    placeholder={
                                                        languages.find(
                                                            (item) =>
                                                                item.id ===
                                                                activeLanguageId,
                                                        )?.nativeName ?? ''
                                                    }
                                                    value={
                                                        option.translations.find(
                                                            (item) =>
                                                                item.languageId ===
                                                                activeLanguageId,
                                                        )?.label ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setForm((current) => ({
                                                            ...current,
                                                            options:
                                                                current.options.map(
                                                                    (
                                                                        candidate,
                                                                        candidateIndex,
                                                                    ) =>
                                                                        candidateIndex ===
                                                                        index
                                                                            ? {
                                                                                  ...candidate,
                                                                                  translations:
                                                                                      candidate.translations.map(
                                                                                          (
                                                                                              translation,
                                                                                          ) =>
                                                                                              translation.languageId ===
                                                                                              activeLanguageId
                                                                                                  ? {
                                                                                                        ...translation,
                                                                                                        label: event
                                                                                                            .target
                                                                                                            .value,
                                                                                                    }
                                                                                                  : translation,
                                                                                      ),
                                                                              }
                                                                            : candidate,
                                                                ),
                                                        }))
                                                    }
                                                />
                                            </FormItem>
                                            <FormItem label="کد رنگ">
                                                <ColorPicker
                                                    value={option.colorHex}
                                                    onChange={(colorHex) =>
                                                        setForm((current) => ({
                                                            ...current,
                                                            options:
                                                                current.options.map(
                                                                    (
                                                                        candidate,
                                                                        candidateIndex,
                                                                    ) =>
                                                                        candidateIndex ===
                                                                        index
                                                                            ? {
                                                                                  ...candidate,
                                                                                  colorHex,
                                                                              }
                                                                            : candidate,
                                                                ),
                                                        }))
                                                    }
                                                />
                                            </FormItem>
                                            <Button
                                                className="self-end"
                                                size="sm"
                                                type="button"
                                                onClick={() =>
                                                    setForm({
                                                        ...form,
                                                        options:
                                                            form.options.filter(
                                                                (
                                                                    _,
                                                                    candidateIndex,
                                                                ) =>
                                                                    candidateIndex !==
                                                                    index,
                                                            ),
                                                    })
                                                }
                                            >
                                                حذف
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button type="button" onClick={() => setOpen(false)}>
                            انصراف
                        </Button>
                        <Button
                            disabled={
                                categoriesQuery.isPending ||
                                categoriesQuery.isError
                            }
                            loading={save.isPending}
                            type="submit"
                            variant="solid"
                        >
                            ذخیره ویژگی
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormDialog>
        </>
    )
}
