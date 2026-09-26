import { useMemo, useState } from 'react'
import { FormikProvider, setIn, useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { LanguageTabs } from '@/features/catalog'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import Loading from '@/components/shared/Loading'
import { Form } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { normalizeError, reportError } from '@/lib/errors'
import { useBlogLanguages } from '../hooks/useBlogLanguages'
import { taxonomySchema } from '../blog.forms'
import { blogApi } from '../blog.api'
import type {
    BlogTaxonomy,
    BlogTaxonomyKind,
    BlogTaxonomyFormValues,
} from '../blog.types'
import BlogTextField from './BlogTextField'

type Props = {
    kind: BlogTaxonomyKind
    item: BlogTaxonomy | null
    onClose: () => void
    onSaved: () => void
}
export default function BlogTaxonomyFormDialog({
    kind,
    item,
    onClose,
    onSaved,
}: Props) {
    const { query, languages, persianId } = useBlogLanguages()
    const [activeLanguage, setActiveLanguage] = useState<string | null>(null)
    const activeId = activeLanguage ?? persianId ?? languages[0]?.id ?? ''
    const initialValues = useMemo<BlogTaxonomyFormValues>(
        () => ({
            isActive: item?.isActive ?? true,
            translations: languages.map((language) => {
                const translation = item?.translations.find(
                    (entry) => entry.languageId === language.id,
                )
                return {
                    languageId: language.id,
                    title: translation?.title ?? '',
                    description: translation?.description ?? '',
                    seoTitle: translation?.seoTitle ?? '',
                    seoDescription: translation?.seoDescription ?? '',
                }
            }),
        }),
        [languages, item],
    )
    const save = useMutation({
        mutationFn: (values: BlogTaxonomyFormValues) =>
            blogApi.saveTaxonomy(kind, item?.id ?? null, values),
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
            toast.error('فیلدهای مشخص شده را اصلاح کنید.')
        },
    })
    const form = useFormik<BlogTaxonomyFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema: taxonomySchema(persianId),
        onSubmit: async (values) => {
            await save.mutateAsync(values).catch(() => undefined)
        },
    })
    const index = form.values.translations.findIndex(
        (translation) => translation.languageId === activeId,
    )
    const language = languages.find((entry) => entry.id === activeId)
    const direction = language?.direction === 'LTR' ? 'ltr' : 'rtl'
    const label = kind === 'categories' ? 'دسته بندی' : 'برچسب'
    return (
        <FormDialog
            isOpen
            isPending={save.isPending}
            title={`${item ? 'ویرایش' : 'افزودن'} ${label}`}
            width={680}
            onClose={onClose}
        >
            <FormikProvider value={form}>
                <Form
                    onSubmit={(event) => {
                        event.preventDefault()
                        if (query.isPending || query.isError) return
                        void form.validateForm().then((errors) => {
                            if (Object.keys(errors).length) {
                                const translationErrors = errors.translations
                                if (Array.isArray(translationErrors))
                                    setActiveLanguage(
                                        form.values.translations[
                                            translationErrors.findIndex(Boolean)
                                        ]?.languageId ?? null,
                                    )
                                toast.error('فیلدهای مشخص شده را اصلاح کنید.')
                            }
                            void form.submitForm()
                        })
                    }}
                >
                    <FormDialogBody className="space-y-4">
                        {query.isPending ? (
                            <Loading loading className="min-h-40" />
                        ) : query.isError ? (
                            <QueryErrorState
                                error={query.error}
                                title="دریافت زبان ها با خطا مواجه شد."
                                onRetry={() => void query.refetch()}
                            />
                        ) : (
                            <>
                                <LanguageTabs
                                    languages={languages}
                                    activeId={activeId}
                                    onChange={setActiveLanguage}
                                >
                                    {index >= 0 && (
                                        <div className="space-y-4">
                                            <BlogTextField
                                                name={`translations.${index}.title`}
                                                label="عنوان"
                                                required={
                                                    language?.code === 'fa'
                                                }
                                                direction={direction}
                                            />
                                            {kind === 'categories' && (
                                                <>
                                                    <BlogTextField
                                                        name={`translations.${index}.description`}
                                                        label="توضیحات"
                                                        multiline
                                                        direction={direction}
                                                    />
                                                    <BlogTextField
                                                        name={`translations.${index}.seoTitle`}
                                                        label="عنوان SEO"
                                                        direction={direction}
                                                    />
                                                    <BlogTextField
                                                        name={`translations.${index}.seoDescription`}
                                                        label="توضیحات SEO"
                                                        direction={direction}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </LanguageTabs>
                                <Checkbox
                                    checked={form.values.isActive}
                                    onChange={(checked) =>
                                        void form.setFieldValue(
                                            'isActive',
                                            checked,
                                        )
                                    }
                                >
                                    فعال
                                </Checkbox>
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
                            disabled={query.isPending || query.isError}
                        >
                            ذخیره
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormikProvider>
        </FormDialog>
    )
}
