import DocumentIcon from '@/assets/icons/iconsax/linear/document.svg?react'
import { LuCoins } from 'react-icons/lu'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import FolderIcon from '@/assets/icons/iconsax/linear/folder-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActionButton from '@/components/shared/TableActionButton'
import TableActions from '@/components/shared/TableActions'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import type { ProductDialogKind, ProductListItem } from '../products.types'

type Props = {
    products: ProductListItem[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    productTitle: (product: ProductListItem) => string
    onAction: (kind: ProductDialogKind, productId: string) => void
    onArchive: (productId: string) => void
    onDelete: (productId: string) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onReorder: (products: ProductListItem[]) => void
    reorderPending: boolean
}

const statusLabels = {
    DRAFT: 'پیش نویس',
    PUBLISHED: 'منتشر شده',
    ARCHIVED: 'بایگانی',
}

export default function ProductTable({
    products,
    loading,
    total,
    page,
    pageSize,
    productTitle,
    onAction,
    onArchive,
    onDelete,
    onPageChange,
    onPageSizeChange,
    onReorder,
    reorderPending,
}: Props) {
    const columns: ColumnDef<ProductListItem>[] = [
        {
            header: 'عنوان',
            id: 'title',
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {productTitle(row.original)}
                </span>
            ),
        },
        {
            header: 'کد',
            accessorKey: 'sku',
            cell: ({ row }) => row.original.sku ?? '—',
        },
        {
            header: 'وضعیت',
            accessorKey: 'status',
            cell: ({ row }) => <Tag>{statusLabels[row.original.status]}</Tag>,
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <TableActions>
                    <TableActionButton icon={<LuCoins />} label="قیمت گذاری" tone="success" onClick={() => onAction('pricing', row.original.id)} />
                    <TableActionButton
                        icon={<EditIcon height={18} width={18} />}
                        label="ویرایش اطلاعات"
                        tone="edit"
                        onClick={() => onAction('form', row.original.id)}
                    />
                    <TableActionButton
                        icon={<DocumentIcon height={18} width={18} />}
                        label="ویژگی ها"
                        tone="view"
                        onClick={() => onAction('attributes', row.original.id)}
                    />
                    <TableActionButton
                        icon={<GalleryIcon height={18} width={18} />}
                        label="تصاویر و گالری"
                        tone="success"
                        onClick={() => onAction('media', row.original.id)}
                    />
                    {row.original.status !== 'ARCHIVED' && (
                        <TableActionButton
                            icon={<FolderIcon height={18} width={18} />}
                            label="بایگانی"
                            tone="view"
                            onClick={() => onArchive(row.original.id)}
                        />
                    )}
                    <TableActionButton
                        icon={<TrashIcon height={18} width={18} />}
                        label="حذف دائمی"
                        tone="danger"
                        onClick={() => onDelete(row.original.id)}
                    />
                </TableActions>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            customNoDataIcon={<TableEmptyStateIcon />}
            data={products}
            draggable
            dragDisabled={loading || reorderPending}
            getRowId={(product) => product.id}
            loading={loading}
            pageSizes={[10, 20, 25, 50, 100, 1000]}
            pagingData={{ total, pageIndex: page, pageSize }}
            onPaginationChange={onPageChange}
            onSelectChange={onPageSizeChange}
            onReorder={onReorder}
        />
    )
}
