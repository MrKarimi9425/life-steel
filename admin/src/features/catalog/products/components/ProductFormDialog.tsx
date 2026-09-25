import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import RelationMultiSelect from '@/components/shared/RelationMultiSelect'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Language } from '@/features/languages'
import { normalizeError } from '@/lib/errors'
import { LanguageTabs } from '../../components/LanguageTabs'
import type { Category, Translation } from '../../types'
import { productsApi } from '../products.api'
import type { ProductBaseForm } from '../products.types'

const RichTextEditor = lazy(
    () => import('@/components/shared/RichTextEditor'),
)

type Props = {
    isOpen: boolean
    productId: string | null
    languages: Language[]
    categories: Category[]
    defaultLanguageId?: string
    onClose: () => void
    onSaved: () => void
}

const emptyTranslation = (languageId: string): Translation => ({
    languageId,
    title: '',
    slug: '',
    summary: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    status: 'DRAFT',
})

const makeForm = (languages: Language[]): ProductBaseForm => ({
    sku: '',
    status: 'DRAFT',
    isFeatured: false,
    categoryIds: [],
    primaryCategoryId: '',
    translations: languages.map((language) => emptyTranslation(language.id)),
})

const statusOptions = [
    { label: 'پیش نویس', value: 'DRAFT' },
    { label: 'منتشر شده', value: 'PUBLISHED' },
    { label: 'بایگانی', value: 'ARCHIVED' },
] as const

const slugPattern = /^[a-z0-9\u0600-\u06ff]+(?:-[a-z0-9\u0600-\u06ff]+)*$/i

export default function ProductFormDialog({
    isOpen,
    productId,
    languages,
    categories,
    defaultLanguageId,
    onClose,
    onSaved,
}: Props) {
    const [activeLanguageId, setActiveLanguageId] = useState('')
    const [form, setForm] = useState<ProductBaseForm>(() => makeForm([]))
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const detailQuery = useQuery({
        queryKey: ['catalog', 'product', productId],
        queryFn: () => productsApi.detail(productId as string),
        enabled: isOpen && Boolean(productId),
    })
    useEffect(() => {
        if (!isOpen) return
        setFieldErrors({})
        setActiveLanguageId(languages[0]?.id ?? '')
        if (!productId) setForm(makeForm(languages))
    }, [isOpen, languages, productId])
    useEffect(() => {
        const product = detailQuery.data
        if (!product || !productId) return
        setForm({
            sku: product.sku ?? '',
            status: product.status,
            isFeatured: product.isFeatured,
            categoryIds: product.categories.map((item) => item.categoryId),
            primaryCategoryId:
                product.categories.find((item) => item.isPrimary)?.categoryId ??
                '',
            translations: languages.map((language) => {
                const translation = product.translations.find(
                        (item) => item.languageId === language.id,
                    )
                return translation
                    ? {
                          languageId: language.id,
                          title: translation.title ?? '',
                          slug: translation.slug ?? '',
                          summary: translation.summary ?? '',
                          description: translation.description ?? '',
                          seoTitle: translation.seoTitle ?? '',
                          seoDescription: translation.seoDescription ?? '',
                          status: translation.status ?? 'DRAFT',
                      }
                    : emptyTranslation(language.id)
            }),
        })
    }, [detailQuery.data, languages, productId])
    const saveMutation = useMutation({
        mutationFn: () =>
            productId
                ? productsApi.updateBase(productId, form)
                : productsApi.create(form),
        onSuccess: () => {
            onSaved()
            onClose()
        },
        onError: (error) => {
            const fields = normalizeError(error).fieldErrors
            setFieldErrors(fields)
            if (Object.keys(fields).length > 0) {
                const firstTranslation = Object.keys(fields).find((key) =>
                    key.startsWith('translations.'),
                )
                const index = firstTranslation
                    ? Number(firstTranslation.split('.')[1])
                    : -1
                if (form.translations[index])
                    setActiveLanguageId(form.translations[index].languageId)
                toast.error('فیلدهای مشخص شده را اصلاح کنید.')
            }
        },
    })
    const currentTranslation = form.translations.find(
        (item) => item.languageId === activeLanguageId,
    )
    const isPersian = languages.some(
        (item) => item.id === activeLanguageId && item.code === 'fa',
    )
    const categoryTitle = (category: Category) =>
        category.translations.find(
            (item) => item.languageId === defaultLanguageId,
        )?.title ??
        category.translations[0]?.title ??
        'بدون عنوان'
    const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: categoryTitle(category),
        description: category.isActive ? 'فعال' : 'غیرفعال',
    }))
    const updateTranslation = (patch: Partial<Translation>) =>
        setForm((current) => ({
            ...current,
            translations: current.translations.map((item) =>
                item.languageId === activeLanguageId
                    ? { ...item, ...patch }
                    : item,
            ),
        }))
    const submit = (event: FormEvent) => {
        event.preventDefault()
        const invalidIndex = form.translations.findIndex(
            (item) => item.slug?.trim() && !slugPattern.test(item.slug.trim()),
        )
        if (invalidIndex !== -1) {
            setFieldErrors({
                [`translations.${invalidIndex}.slug`]:
                    'شناسه صفحه باید بدون فاصله باشد. برای جدا کردن واژه ها از خط تیره استفاده کنید.',
            })
            setActiveLanguageId(form.translations[invalidIndex].languageId)
            toast.error('شناسه صفحه معتبر نیست.')
            return
        }
        setFieldErrors({})
        saveMutation.mutate()
    }
    const activeTranslationIndex = form.translations.findIndex(
        (item) => item.languageId === activeLanguageId,
    )
    const slugError = fieldErrors[`translations.${activeTranslationIndex}.slug`]
    const validationErrors = Object.entries(fieldErrors).map(([path, message]) => {
        const parts = path.split('.')
        const field = parts[0] === 'translations' ? parts[2] : parts[0]
        const labels: Record<string, string> = {
            title: 'عنوان محصول',
            slug: 'شناسه صفحه',
            summary: 'خلاصه',
            description: 'توضیحات کامل',
            seoTitle: 'عنوان SEO',
            seoDescription: 'توضیحات SEO',
            sku: 'کد محصول',
            categoryIds: 'دسته بندی های محصول',
            primaryCategoryId: 'دسته بندی اصلی',
        }
        const language = parts[0] === 'translations'
            ? languages.find((item) => item.id === form.translations[Number(parts[1])]?.languageId)
            : undefined
        return {
            path,
            label: `${labels[field] ?? field}${language ? ` (${language.name})` : ''}`,
            message,
        }
    })

    return (
        <FormDialog
            isOpen={isOpen}
            title={productId ? 'ویرایش اطلاعات محصول' : 'محصول جدید'}
            width={920}
            onClose={onClose}
        >
            <Form onSubmit={submit}>
                <FormDialogBody className="space-y-5">
                    {validationErrors.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                            <p className="font-semibold">موارد زیر را اصلاح کنید:</p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                {validationErrors.map((item) => (
                                    <li key={item.path}>{item.label}: {item.message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <LanguageTabs
                        activeId={activeLanguageId}
                        languages={languages}
                        onChange={setActiveLanguageId}
                    >
                        {currentTranslation && (
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormItem
                                        asterisk={isPersian}
                                        label="عنوان محصول"
                                    >
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            value={currentTranslation.title}
                                            onChange={(event) =>
                                                updateTranslation({
                                                    title: event.target.value,
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
                                            onChange={(event) => {
                                                setFieldErrors({})
                                                updateTranslation({
                                                    slug: event.target.value,
                                                })
                                            }}
                                        />
                                        {slugError && (
                                            <p className="mt-1 text-xs text-red-600" role="alert">
                                                {slugError}
                                            </p>
                                        )}
                                    </FormItem>
                                </div>
                                <FormItem label="خلاصه">
                                    <Input
                                        dir={isPersian ? 'rtl' : 'ltr'}
                                        textArea
                                        rows={3}
                                        value={currentTranslation.summary}
                                        onChange={(event) =>
                                            updateTranslation({
                                                summary: event.target.value,
                                            })
                                        }
                                    />
                                </FormItem>
                                <FormItem label="توضیحات کامل">
                                    <Suspense fallback={<div className="min-h-40 rounded-xl border border-gray-200 dark:border-gray-700" />}>
                                        <RichTextEditor
                                            direction={isPersian ? 'rtl' : 'ltr'}
                                            value={currentTranslation.description ?? ''}
                                            onChange={(description) =>
                                                updateTranslation({
                                                    description,
                                                })
                                            }
                                        />
                                    </Suspense>
                                </FormItem>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormItem label="عنوان SEO">
                                        <Input
                                            dir={isPersian ? 'rtl' : 'ltr'}
                                            value={currentTranslation.seoTitle}
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
                                <Checkbox
                                    checked={
                                        currentTranslation.status ===
                                        'PUBLISHED'
                                    }
                                    onChange={(checked) =>
                                        updateTranslation({
                                            status: checked
                                                ? 'PUBLISHED'
                                                : 'DRAFT',
                                        })
                                    }
                                >
                                    انتشار این ترجمه در سایت
                                </Checkbox>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    این زبان فقط زمانی در سایت نمایش داده می شود که
                                    خود محصول نیز منتشر شده باشد.
                                </p>
                            </div>
                        )}
                    </LanguageTabs>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormItem label="کد محصول">
                            <Input
                                value={form.sku}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        sku: event.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label="وضعیت">
                            <Select
                                isSearchable={false}
                                options={statusOptions}
                                value={statusOptions.find(
                                    (option) => option.value === form.status,
                                )}
                                onChange={(option) =>
                                    setForm({
                                        ...form,
                                        status: option?.value ?? 'DRAFT',
                                    })
                                }
                            />
                        </FormItem>
                    </div>
                    <section>
                        <div className="mb-3">
                            <h5>دسته بندی ها</h5>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                دسته بندی های محصول و سپس دسته اصلی را انتخاب
                                کنید.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormItem label="دسته بندی های محصول">
                                <RelationMultiSelect
                                    options={categoryOptions}
                                    value={form.categoryIds}
                                    onChange={(categoryIds) =>
                                        setForm((current) => ({
                                            ...current,
                                            categoryIds,
                                            primaryCategoryId:
                                                categoryIds.includes(
                                                    current.primaryCategoryId,
                                                )
                                                    ? current.primaryCategoryId
                                                    : '',
                                        }))
                                    }
                                />
                            </FormItem>
                            <FormItem label="دسته بندی اصلی">
                                <Select
                                    isClearable
                                    isDisabled={form.categoryIds.length === 0}
                                    options={categoryOptions.filter((option) =>
                                        form.categoryIds.includes(option.value),
                                    )}
                                    value={categoryOptions.find(
                                        (option) =>
                                            option.value ===
                                            form.primaryCategoryId,
                                    )}
                                    onChange={(option) =>
                                        setForm({
                                            ...form,
                                            primaryCategoryId:
                                                option?.value ?? '',
                                        })
                                    }
                                />
                            </FormItem>
                        </div>
                    </section>
                    <Checkbox
                        checked={form.isFeatured}
                        onChange={(checked) =>
                            setForm({ ...form, isFeatured: checked })
                        }
                    >
                        محصول منتخب
                    </Checkbox>
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" onClick={onClose}>
                        انصراف
                    </Button>
                    <Button
                        loading={saveMutation.isPending}
                        type="submit"
                        variant="solid"
                    >
                        ذخیره محصول
                    </Button>
                </FormDialogActions>
            </Form>
        </FormDialog>
    )
}
