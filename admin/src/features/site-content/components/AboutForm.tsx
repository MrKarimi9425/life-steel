import { lazy, Suspense, useMemo, useState } from 'react'
import { FormikProvider, useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { LanguageTabs } from '@/features/catalog'
import {
    GalleryImageDialog,
    useGalleryImageSelection,
    useContentLanguages,
    TranslatedTextField,
} from '@/features/blog'
import { Form, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi } from '../site-content.api'
import type { PageValues, SitePage } from '../site-content.types'
const BlockEditor = lazy(() => import('@/components/shared/BlockEditor'))
export default function AboutForm({
    page,
    onSaved,
}: {
    page: SitePage
    onSaved: () => void
}) {
    const { query, languages, persianId } = useContentLanguages()
    const [active, setActive] = useState<string | null>(null)
    const activeId = active ?? persianId ?? languages[0]?.id ?? ''
    const images = useGalleryImageSelection()
    const initialValues = useMemo<PageValues>(
        () => ({
            isPublished: page.isPublished,
            translations: languages.map((l) => {
                const t = page.translations.find((t) => t.languageId === l.id)
                return {
                    languageId: l.id,
                    title: t?.title ?? '',
                    content: t?.content ?? {
                        type: 'doc',
                        content: [{ type: 'paragraph' }],
                    },
                    seoTitle: t?.seoTitle ?? '',
                    seoDescription: t?.seoDescription ?? '',
                }
            }),
        }),
        [languages, page.isPublished, page.translations],
    )
    const save = useMutation({
        mutationFn: siteContentApi.saveAbout,
        onSuccess: () => {
            onSaved()
        },
    })
    const form = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            translations: Yup.array().of(
                Yup.object({
                    title: Yup.string()
                        .max(255, 'عنوان باید حداکثر ۲۵۵ کاراکتر باشد.')
                        .test(
                            'persian',
                            'عنوان فارسی الزامی است.',
                            function (value) {
                                return (
                                    this.parent.languageId !== persianId ||
                                    Boolean(value?.trim())
                                )
                            },
                        ),
                    seoTitle: Yup.string()
                        .nullable()
                        .max(255, 'عنوان SEO باید حداکثر ۲۵۵ کاراکتر باشد.'),
                    seoDescription: Yup.string()
                        .nullable()
                        .max(500, 'توضیحات SEO باید حداکثر ۵۰۰ کاراکتر باشد.'),
                }),
            ),
        }),
        onSubmit: (values) => save.mutate(values),
    })
    const index = form.values.translations.findIndex(
        (t) => t.languageId === activeId,
    )
    const direction =
        languages.find((l) => l.id === activeId)?.direction === 'LTR'
            ? 'ltr'
            : 'rtl'
    return (
        <>
            <FormikProvider value={form}>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (save.isPending || query.isPending || query.isError)
                            return
                        void form.validateForm().then((errors) => {
                            if (Object.keys(errors).length) {
                                toast.error('فیلدهای مشخص شده را اصلاح کنید.')
                                if (Array.isArray(errors.translations))
                                    setActive(
                                        form.values.translations[
                                            errors.translations.findIndex(
                                                Boolean,
                                            )
                                        ]?.languageId ?? null,
                                    )
                            }
                            void form.submitForm()
                        })
                    }}
                >
                    <div className="space-y-5">
                        {query.isPending ? (
                            <Loading loading />
                        ) : query.isError ? (
                            <QueryErrorState
                                error={query.error}
                                title="دریافت زبان ها ناموفق بود."
                                onRetry={() => void query.refetch()}
                            />
                        ) : (
                            <>
                                <LanguageTabs
                                    languages={languages}
                                    activeId={activeId}
                                    onChange={setActive}
                                >
                                    {index >= 0 && (
                                        <div className="space-y-4">
                                            <TranslatedTextField
                                                name={`translations.${index}.title`}
                                                label="عنوان صفحه"
                                                required={
                                                    activeId === persianId
                                                }
                                                direction={direction}
                                            />
                                            <FormItem label="محتوای صفحه">
                                                <Suspense
                                                    fallback={
                                                        <Loading
                                                            loading
                                                            className="min-h-40"
                                                        />
                                                    }
                                                >
                                                    <BlockEditor
                                                        key={activeId}
                                                        value={
                                                            form.values
                                                                .translations[
                                                                index
                                                            ].content
                                                        }
                                                        direction={direction}
                                                        disabled={
                                                            save.isPending
                                                        }
                                                        onChange={(content) =>
                                                            void form.setFieldValue(
                                                                `translations.${index}.content`,
                                                                content,
                                                            )
                                                        }
                                                        onSelectImage={
                                                            images.select
                                                        }
                                                    />
                                                </Suspense>
                                            </FormItem>
                                            <TranslatedTextField
                                                name={`translations.${index}.seoTitle`}
                                                label="عنوان SEO"
                                                direction={direction}
                                            />
                                            <TranslatedTextField
                                                name={`translations.${index}.seoDescription`}
                                                label="توضیحات SEO"
                                                multiline
                                                direction={direction}
                                            />
                                        </div>
                                    )}
                                </LanguageTabs>
                                <Checkbox
                                    checked={form.values.isPublished}
                                    onChange={(checked) =>
                                        void form.setFieldValue(
                                            'isPublished',
                                            checked,
                                        )
                                    }
                                >
                                    انتشار صفحه در سایت
                                </Checkbox>
                            </>
                        )}
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200 pt-5 dark:border-gray-700">
                        <Button
                            type="submit"
                            variant="solid"
                            disabled={query.isPending || query.isError}
                            loading={save.isPending}
                        >
                            ذخیره
                        </Button>
                    </div>
                </Form>
            </FormikProvider>
            {images.isOpen && (
                <GalleryImageDialog
                    title="انتخاب تصویر درباره ما"
                    emptyMessage="ابتدا تصویر را از گالری درباره ما بارگذاری کنید."
                    assets={page.media.map((m) => m.media)}
                    languageId={activeId}
                    onFinish={images.finish}
                />
            )}
        </>
    )
}
