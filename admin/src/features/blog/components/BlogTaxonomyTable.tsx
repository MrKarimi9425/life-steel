import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import type { BlogTaxonomy } from '../blog.types'

type Props = {
    items: BlogTaxonomy[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    title: (item: BlogTaxonomy) => string
    onEdit: (item: BlogTaxonomy) => void
    onDelete: (item: BlogTaxonomy) => void
    onPage: (page: number) => void
    onPageSize: (size: number) => void
    onReorder: (items: BlogTaxonomy[]) => void
    pending: boolean
}
export default function BlogTaxonomyTable({
    items,
    loading,
    total,
    page,
    pageSize,
    title,
    onEdit,
    onDelete,
    onPage,
    onPageSize,
    onReorder,
    pending,
}: Props) {
    const columns: ColumnDef<BlogTaxonomy>[] = [
        {
            id: 'title',
            header: 'عنوان',
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {title(row.original)}
                </span>
            ),
        },
        {
            id: 'count',
            header: 'تعداد مقاله ها',
            cell: ({ row }) => row.original._count.articles,
        },
        {
            accessorKey: 'isActive',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Tag>{row.original.isActive ? 'فعال' : 'غیرفعال'}</Tag>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <TableActions>
                    <TableActionButton
                        icon={<EditIcon width={18} height={18} />}
                        label="ویرایش"
                        tone="edit"
                        onClick={() => onEdit(row.original)}
                    />
                    <TableActionButton
                        icon={<TrashIcon width={18} height={18} />}
                        label="حذف دائمی"
                        tone="danger"
                        onClick={() => onDelete(row.original)}
                    />
                </TableActions>
            ),
        },
    ]
    return (
        <DataTable
            columns={columns}
            data={items}
            loading={loading}
            customNoDataIcon={<TableEmptyStateIcon />}
            draggable
            dragDisabled={pending || loading}
            getRowId={(item) => item.id}
            pageSizes={[10, 20, 25, 50, 100, 1000]}
            pagingData={{ total, pageIndex: page, pageSize }}
            onPaginationChange={onPage}
            onSelectChange={onPageSize}
            onReorder={onReorder}
        />
    )
}
