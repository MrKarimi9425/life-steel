import ListFilters from '@/components/shared/ListFilters'
import ListSearchInput from '@/components/shared/ListSearchInput'
import Select from '@/components/ui/Select'
import type { Category } from '../../types'

type Props = {
    categories: Category[]
    categoryId: string
    status: string
    categoryTitle: (category: Category) => string
    onCategoryChange: (value: string) => void
    onSearch: (value: string) => void
    onStatusChange: (value: string) => void
}

const statusOptions = [
    { label: 'همه وضعیت ها', value: '' },
    { label: 'پیش نویس', value: 'DRAFT' },
    { label: 'منتشر شده', value: 'PUBLISHED' },
    { label: 'بایگانی', value: 'ARCHIVED' },
]

export default function ProductFilters({
    categories,
    categoryId,
    status,
    categoryTitle,
    onCategoryChange,
    onSearch,
    onStatusChange,
}: Props) {
    const categoryOptions = [
        { label: 'همه دسته بندی ها', value: '' },
        ...categories.map((category) => ({
            label: categoryTitle(category),
            value: category.id,
        })),
    ]

    return (
        <ListFilters>
            <ListSearchInput
                placeholder="جستجوی عنوان یا کد"
                onSearch={(value) => onSearch(value.trim())}
            />
            <Select
                isSearchable={false}
                options={statusOptions}
                value={statusOptions.find((item) => item.value === status)}
                onChange={(option) => onStatusChange(option?.value ?? '')}
            />
            <Select
                isSearchable={false}
                options={categoryOptions}
                value={categoryOptions.find(
                    (item) => item.value === categoryId,
                )}
                onChange={(option) => onCategoryChange(option?.value ?? '')}
            />
        </ListFilters>
    )
}
