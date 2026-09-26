import ListFilters from '@/components/shared/ListFilters'
import ListSearchInput from '@/components/shared/ListSearchInput'
import Select from '@/components/ui/Select'
import type { ArticleListFilters, BlogTaxonomy } from '../blog.types'

type Props = {
    filters: ArticleListFilters
    categories: BlogTaxonomy[]
    tags: BlogTaxonomy[]
    taxonomyTitle: (item: BlogTaxonomy) => string
    onChange: (patch: Partial<ArticleListFilters>) => void
}

const statusOptions = [
    { label: 'همه وضعیت ها', value: '' },
    { label: 'پیش نویس', value: 'DRAFT' },
    { label: 'منتشر شده', value: 'PUBLISHED' },
    { label: 'بایگانی', value: 'ARCHIVED' },
] as const

export default function ArticleFilters({
    filters,
    categories,
    tags,
    taxonomyTitle,
    onChange,
}: Props) {
    const categoryOptions = [
        { label: 'همه دسته بندی ها', value: '' },
        ...categories.map((item) => ({
            label: taxonomyTitle(item),
            value: item.id,
        })),
    ]
    const tagOptions = [
        { label: 'همه برچسب ها', value: '' },
        ...tags.map((item) => ({
            label: taxonomyTitle(item),
            value: item.id,
        })),
    ]

    return (
        <ListFilters>
            <ListSearchInput
                placeholder="جستجوی عنوان مقاله"
                onSearch={(value) => onChange({ search: value.trim() })}
            />
            <Select
                isSearchable={false}
                options={statusOptions}
                value={statusOptions.find(
                    (item) => item.value === filters.status,
                )}
                onChange={(option) => onChange({ status: option?.value ?? '' })}
            />
            <Select
                options={categoryOptions}
                value={categoryOptions.find(
                    (item) => item.value === filters.categoryId,
                )}
                onChange={(option) =>
                    onChange({ categoryId: option?.value ?? '' })
                }
            />
            <Select
                options={tagOptions}
                value={tagOptions.find((item) => item.value === filters.tagId)}
                onChange={(option) => onChange({ tagId: option?.value ?? '' })}
            />
        </ListFilters>
    )
}
