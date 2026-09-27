import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import Tag from '@/components/ui/Tag'
import { messageStatuses, type ContactMessage } from '../site-content.types'
export default function MessagesTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPage,
    onPageSize,
    onOpen,
    onDelete,
}: {
    items: ContactMessage[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPage: (page: number) => void
    onPageSize: (size: number) => void
    onOpen: (item: ContactMessage) => void
    onDelete: (item: ContactMessage) => void
}) {
    const columns: ColumnDef<ContactMessage>[] = [
        { accessorKey: 'name', header: 'نام' },
        { accessorKey: 'subject', header: 'موضوع' },
        {
            accessorKey: 'phone',
            header: 'شماره تماس',
            cell: ({ row }) => <span dir="ltr">{row.original.phone}</span>,
        },
        {
            accessorKey: 'createdAt',
            header: 'تاریخ',
            cell: ({ row }) =>
                new Date(row.original.createdAt).toLocaleString('fa-IR'),
        },
        {
            accessorKey: 'status',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Tag>
                    {
                        messageStatuses.find(
                            (s) => s.value === row.original.status,
                        )?.label
                    }
                </Tag>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <TableActions>
                    <TableActionButton
                        icon={<EditIcon width={18} height={18} />}
                        label="مشاهده و پیگیری"
                        tone="edit"
                        onClick={() => onOpen(row.original)}
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
            getRowId={(r) => r.id}
            pageSizes={[10, 20, 25, 50, 100, 1000]}
            pagingData={{ total, pageIndex: page, pageSize }}
            onPaginationChange={onPage}
            onSelectChange={onPageSize}
        />
    )
}
