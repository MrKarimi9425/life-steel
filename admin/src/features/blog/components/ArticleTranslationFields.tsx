import { lazy, Suspense } from 'react'
import { useFormikContext } from 'formik'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem } from '@/components/ui/Form'
import type { Language } from '@/features/languages'
import type { BlockEditorImage } from '@/components/shared/BlockEditor'
import { reportError } from '@/lib/errors'
import BlogTextField from './BlogTextField'
import Loading from '@/components/shared/Loading'
import type { ArticleFormValues } from '../blog.types'

const BlockEditor = lazy(() => import('@/components/shared/BlockEditor'))
type Props = {
    index: number
    language: Language
    onSelectImage?: () => Promise<BlockEditorImage | null>
}
export default function ArticleTranslationFields({
    index,
    language,
    onSelectImage,
}: Props) {
    const form = useFormikContext<ArticleFormValues>()
    const translation = form.values.translations[index]
    const direction = language.direction === 'LTR' ? 'ltr' : 'rtl'
    const path = `translations.${index}`
    if (!translation) return null
    return (
        <div className="space-y-4">
            <BlogTextField
                name={`${path}.title`}
                label="عنوان مقاله"
                direction={direction}
                required={language.code === 'fa'}
            />
            <BlogTextField
                name={`${path}.summary`}
                label="خلاصه"
                direction={direction}
                multiline
            />
            <FormItem label="محتوای مقاله">
                <Suspense fallback={<Loading loading className="min-h-40" />}>
                    <BlockEditor
                        key={language.id}
                        value={translation.content}
                        direction={direction}
                        onChange={(content) =>
                            void form.setFieldValue(
                                `${path}.content`,
                                content,
                                false,
                            )
                        }
                        onSelectImage={onSelectImage}
                        onImageError={reportError}
                    />
                </Suspense>
            </FormItem>
            <div className="grid gap-4 sm:grid-cols-2">
                <BlogTextField
                    name={`${path}.seoTitle`}
                    label="عنوان SEO"
                    direction={direction}
                />
                <BlogTextField
                    name={`${path}.seoDescription`}
                    label="توضیحات SEO"
                    direction={direction}
                />
            </div>
            <Checkbox
                checked={translation.status === 'PUBLISHED'}
                onChange={(checked) =>
                    void form.setFieldValue(
                        `${path}.status`,
                        checked ? 'PUBLISHED' : 'DRAFT',
                    )
                }
            >
                انتشار این ترجمه در سایت
            </Checkbox>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                این زبان فقط زمانی در سایت نمایش داده میشود که خود مقاله نیز
                منتشر شده باشد.
            </p>
        </div>
    )
}
