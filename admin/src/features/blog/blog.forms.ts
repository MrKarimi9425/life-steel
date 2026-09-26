import * as Yup from 'yup'
import type { Language } from '@/features/languages'
import type { ArticleDetail, ArticleFormValues } from './blog.types'

export function articleInitialValues(
    languages: Language[],
    article?: ArticleDetail,
): ArticleFormValues {
    return {
        status: article?.status ?? 'DRAFT',
        categoryIds: article?.categories.map((item) => item.categoryId) ?? [],
        primaryCategoryId:
            article?.categories.find((item) => item.isPrimary)?.categoryId ??
            null,
        tagIds: article?.tags.map((item) => item.tagId) ?? [],
        translations: languages.map((language) => {
            const existing = article?.translations.find(
                (item) => item.languageId === language.id,
            )
            return {
                languageId: language.id,
                title: existing?.title ?? '',
                summary: existing?.summary ?? '',
                content: existing?.content ?? {
                    type: 'doc',
                    content: [{ type: 'paragraph' }],
                },
                seoTitle: existing?.seoTitle ?? '',
                seoDescription: existing?.seoDescription ?? '',
                status: existing?.status ?? 'DRAFT',
            }
        }),
    }
}

export const articleSchema = (persianId?: string) =>
    Yup.object({
        status: Yup.string()
            .oneOf(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
            .required(),
        primaryCategoryId: Yup.string()
            .nullable()
            .test(
                'primary',
                'دسته اصلی را از دسته بندی های انتخاب شده انتخاب کنید.',
                function (value) {
                    const parent = this.parent as ArticleFormValues
                    return parent.categoryIds.length
                        ? Boolean(value && parent.categoryIds.includes(value))
                        : !value
                },
            ),
        translations: Yup.array().of(
            Yup.object({
                languageId: Yup.string().required(),
                title: Yup.string()
                    .trim()
                    .max(255, 'عنوان نباید بیشتر از ۲۵۵ حرف باشد.')
                    .test(
                        'persian-title',
                        'عنوان فارسی الزامی است.',
                        function (value) {
                            const parent = this
                                .parent as ArticleFormValues['translations'][number]
                            return (
                                parent.languageId !== persianId ||
                                Boolean(value)
                            )
                        },
                    ),
                summary: Yup.string().max(10000, 'خلاصه بیش از حد طولانی است.'),
                seoTitle: Yup.string().max(
                    255,
                    'عنوان SEO بیش از حد طولانی است.',
                ),
                seoDescription: Yup.string().max(
                    500,
                    'توضیحات SEO نباید بیشتر از ۵۰۰ حرف باشد.',
                ),
            }),
        ),
    })

export const taxonomySchema = (persianId?: string) =>
    Yup.object({
        translations: Yup.array().of(
            Yup.object({
                title: Yup.string()
                    .trim()
                    .max(180, 'عنوان نباید بیشتر از ۱۸۰ حرف باشد.')
                    .test(
                        'persian-title',
                        'عنوان فارسی الزامی است.',
                        function (value) {
                            const parent = this.parent as { languageId: string }
                            return (
                                parent.languageId !== persianId ||
                                Boolean(value)
                            )
                        },
                    ),
                description: Yup.string().max(
                    10000,
                    'توضیحات بیش از حد طولانی است.',
                ),
                seoTitle: Yup.string().max(
                    255,
                    'عنوان SEO بیش از حد طولانی است.',
                ),
                seoDescription: Yup.string().max(
                    500,
                    'توضیحات SEO نباید بیشتر از ۵۰۰ حرف باشد.',
                ),
            }),
        ),
    })
