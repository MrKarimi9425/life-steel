import { useFormikContext } from 'formik'
import RelationMultiSelect from '@/components/shared/RelationMultiSelect'
import { FormItem } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import type { ArticleFormValues, BlogTaxonomy } from '../blog.types'

type Props = {
    categories: BlogTaxonomy[]
    tags: BlogTaxonomy[]
    persianId?: string
}
export default function ArticleRelations({
    categories,
    tags,
    persianId,
}: Props) {
    const form = useFormikContext<ArticleFormValues>()
    const options = (items: BlogTaxonomy[]) =>
        items.map((item) => ({
            value: item.id,
            label:
                item.translations.find(
                    (entry) => entry.languageId === persianId,
                )?.title ??
                item.translations[0]?.title ??
                'بدون عنوان',
            description: item.isActive ? 'فعال' : 'غیرفعال',
        }))
    const categoriesOptions = options(categories)
    const error = form.errors.primaryCategoryId
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <FormItem label="دسته بندی های مقاله">
                    <RelationMultiSelect
                        options={categoriesOptions}
                        value={form.values.categoryIds}
                        onChange={(categoryIds) => {
                            void form.setValues((current) => ({
                                ...current,
                                categoryIds,
                                primaryCategoryId: categoryIds.includes(
                                    current.primaryCategoryId ?? '',
                                )
                                    ? current.primaryCategoryId
                                    : null,
                            }))
                        }}
                    />
                </FormItem>
                <FormItem
                    label="دسته بندی اصلی"
                    invalid={Boolean(error && form.submitCount)}
                    errorMessage={error}
                >
                    <Select
                        isClearable
                        isDisabled={!form.values.categoryIds.length}
                        options={categoriesOptions.filter((item) =>
                            form.values.categoryIds.includes(item.value),
                        )}
                        value={
                            categoriesOptions.find(
                                (item) =>
                                    item.value ===
                                    form.values.primaryCategoryId,
                            ) ?? null
                        }
                        onChange={(option) =>
                            void form.setFieldValue(
                                'primaryCategoryId',
                                option?.value ?? null,
                            )
                        }
                    />
                </FormItem>
            </div>
            <FormItem label="برچسب ها">
                <RelationMultiSelect
                    options={options(tags)}
                    value={form.values.tagIds}
                    onChange={(ids) => void form.setFieldValue('tagIds', ids)}
                />
            </FormItem>
        </>
    )
}
