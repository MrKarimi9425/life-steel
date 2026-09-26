import { useMemo, useState } from 'react'
import { FormikProvider, setIn, useFormik } from 'formik'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { LanguageTabs } from '@/features/catalog'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Form, FormItem } from '@/components/ui/Form'
import { normalizeError, reportError } from '@/lib/errors'
import { blogApi } from '../blog.api'
import { articleDetailOptions, blogTaxonomyOptions } from '../blog.queries'
import { articleInitialValues, articleSchema } from '../blog.forms'
import { articleMediaAssets } from '../blog.media'
import { useBlogLanguages } from '../hooks/useBlogLanguages'
import { useArticleImageSelection } from '../hooks/useArticleImageSelection'
import ArticleTranslationFields from './ArticleTranslationFields'
import ArticleRelations from './ArticleRelations'
import ArticleImageDialog from './ArticleImageDialog'
import type { ArticleFormValues } from '../blog.types'

type Props = {
    articleId: string | null
    onClose: () => void
    onSaved: () => void
}
const statusOptions = [
    { label: 'پیش نویس', value: 'DRAFT' },
    { label: 'منتشر شده', value: 'PUBLISHED' },
    { label: 'بایگانی', value: 'ARCHIVED' },
] as const

export default function ArticleFormDialog({
    articleId,
    onClose,
    onSaved,
}: Props) {
    const { query: languagesQuery, languages, persianId } = useBlogLanguages()
    const detail = useQuery(articleDetailOptions(articleId))
    const categories = useQuery(blogTaxonomyOptions('categories'))
    const tags = useQuery(blogTaxonomyOptions('tags'))
    const [activeLanguage, setActiveLanguage] = useState<string | null>(null)
    const activeId = activeLanguage ?? persianId ?? languages[0]?.id ?? ''
    const imageSelection = useArticleImageSelection()
    const initialValues = useMemo(
        () => articleInitialValues(languages, detail.data),
        [languages, detail.data],
    )
    const save = useMutation({
        mutationFn: (values: ArticleFormValues) =>
            blogApi.saveArticle(articleId, values),
        meta: { suppressGlobalError: true },
        onSuccess: () => {
            onSaved()
            onClose()
        },
        onError: (error) => {
            const fields = normalizeError(error).fieldErrors
            if (!Object.keys(fields).length) {
                reportError(error)
                return
            }
            let errors = {}
            for (const [key, value] of Object.entries(fields))
                errors = setIn(errors, key, value)
            form.setErrors(errors)
            const key = Object.keys(fields).find((path) =>
                path.startsWith('translations.'),
            )
            if (key)
                setActiveLanguage(
                    form.values.translations[Number(key.split('.')[1])]
                        ?.languageId ?? null,
                )
            toast.error('فیلدهای مشخص شده را اصلاح کنید.')
        },
    })
    const form = useFormik<ArticleFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema: articleSchema(persianId),
        onSubmit: async (values) => {
            await save.mutateAsync(values).catch(() => undefined)
        },
    })
    const blockers = [
        languagesQuery,
        ...(articleId ? [detail] : []),
        categories,
        tags,
    ]
    const failed = blockers.find((query) => query.isError)
    const loading = blockers.some((query) => query.isPending)
    const index = form.values.translations.findIndex(
        (item) => item.languageId === activeId,
    )
    const language = languages.find((item) => item.id === activeId)
    return (
        <>
            <FormDialog
                isOpen
                isPending={save.isPending}
                title={articleId ? 'ویرایش مقاله' : 'مقاله جدید'}
                width={1000}
                onClose={onClose}
            >
                <FormikProvider value={form}>
                    <Form
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (loading || failed) return
                            void form.validateForm().then((errors) => {
                                if (Object.keys(errors).length) {
                                    const translationErrors =
                                        errors.translations
                                    if (Array.isArray(translationErrors)) {
                                        const invalid =
                                            translationErrors.findIndex(Boolean)
                                        setActiveLanguage(
                                            form.values.translations[invalid]
                                                ?.languageId ?? null,
                                        )
                                    }
                                    toast.error(
                                        'فیلدهای مشخص شده را اصلاح کنید.',
                                    )
                                }
                                void form.submitForm()
                            })
                        }}
                    >
                        <FormDialogBody className="space-y-5">
                            {loading ? (
                                <Loading loading className="min-h-40" />
                            ) : failed ? (
                                <QueryErrorState
                                    error={failed.error}
                                    title="دریافت اطلاعات فرم با خطا مواجه شد."
                                    onRetry={() => void failed.refetch()}
                                />
                            ) : (
                                <>
                                    <LanguageTabs
                                        languages={languages}
                                        activeId={activeId}
                                        onChange={setActiveLanguage}
                                    >
                                        {language && index >= 0 && (
                                            <ArticleTranslationFields
                                                index={index}
                                                language={language}
                                                onSelectImage={
                                                    articleId
                                                        ? imageSelection.select
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </LanguageTabs>
                                    {!articleId && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            برای افزودن تصویر به متن، ابتدا
                                            مقاله را ذخیره و از اکشن گالری
                                            تصاویر را بارگذاری کنید.
                                        </p>
                                    )}
                                    <FormItem label="وضعیت مقاله">
                                        <Select
                                            isSearchable={false}
                                            options={statusOptions}
                                            value={statusOptions.find(
                                                (item) =>
                                                    item.value ===
                                                    form.values.status,
                                            )}
                                            onChange={(option) =>
                                                void form.setFieldValue(
                                                    'status',
                                                    option?.value ?? 'DRAFT',
                                                )
                                            }
                                        />
                                    </FormItem>
                                    <ArticleRelations
                                        categories={categories.data ?? []}
                                        tags={tags.data ?? []}
                                        persianId={persianId}
                                    />
                                </>
                            )}
                        </FormDialogBody>
                        <FormDialogActions>
                            <Button
                                type="button"
                                disabled={save.isPending}
                                onClick={onClose}
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                loading={save.isPending}
                                disabled={loading || Boolean(failed)}
                            >
                                ذخیره مقاله
                            </Button>
                        </FormDialogActions>
                    </Form>
                </FormikProvider>
            </FormDialog>
            {imageSelection.isOpen && (
                <ArticleImageDialog
                    assets={articleMediaAssets(detail.data)}
                    languageId={activeId}
                    onFinish={imageSelection.finish}
                />
            )}
        </>
    )
}
