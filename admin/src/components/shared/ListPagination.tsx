import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'

const defaultPageSizes = [10, 25, 50, 100, 1000]

interface ListPaginationProps {
    page: number
    pageSize: number
    total: number
    pageSizes?: number[]
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export default function ListPagination({
    page,
    pageSize,
    total,
    pageSizes = defaultPageSizes,
    onPageChange,
    onPageSizeChange,
}: ListPaginationProps) {
    if (total === 0) return null

    const options = pageSizes.map((value) => ({
        label: `${value.toLocaleString('fa-IR')} ردیف`,
        value,
    }))

    return (
        <div className="sticky bottom-0 z-20 mt-auto flex w-full min-w-0 flex-col items-stretch gap-2 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800">
            <Pagination
                className="mx-auto max-w-full sm:mx-0"
                currentPage={page}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
            />
            <Select
                className="list-page-size-select w-full sm:w-36 sm:shrink-0"
                isSearchable={false}
                menuPlacement="top"
                options={options}
                size="sm"
                value={options.find((option) => option.value === pageSize)}
                onChange={(option) =>
                    onPageSizeChange(option?.value ?? defaultPageSizes[0])
                }
            />
        </div>
    )
}
