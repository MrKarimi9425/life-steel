import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import Tag from '@/components/ui/Tag'
import { contactTypes, type ContactInformation } from '../site-content.types'
type Props = {
    items: ContactInformation[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    persianId?: string
    pending: boolean
    onEdit: (item: ContactInformation) => void
    onDelete: (item: ContactInformation) => void
    onPage: (page: number) => void
    onPageSize: (size: number) => void
    onReorder: (items: ContactInformation[]) => void
}
export default function ContactsTable(props: Props) {
    const columns: ColumnDef<ContactInformation>[] = [
        {
            id: 'title',
            header: 'عنوان',
            cell: ({ row }) =>
                row.original.translations.find(
                    (t) => t.languageId === props.persianId,
                )?.title ?? row.original.translations[0]?.title,
        },
        {
            accessorKey: 'type',
            header: 'نوع',
            cell: ({ row }) =>
                contactTypes.find((t) => t.value === row.original.type)?.label,
        },
        {
            id: 'value',
            header: 'مقدار',
            cell: ({ row }) => (
                <span className="block max-w-80 truncate">
                    {row.original.translations.find(
                        (t) => t.languageId === props.persianId,
                    )?.value ?? row.original.translations[0]?.value}
                </span>
            ),
        },
        {
            id: 'status',
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
                        onClick={() => props.onEdit(row.original)}
                    />
                    <TableActionButton
                        icon={<TrashIcon width={18} height={18} />}
                        label="حذف دائمی"
                        tone="danger"
                        onClick={() => props.onDelete(row.original)}
                    />
                </TableActions>
            ),
        },
    ]
    return (
        <DataTable
            columns={columns}
            data={props.items}
            loading={props.loading}
            customNoDataIcon={<TableEmptyStateIcon />}
            draggable
            dragDisabled={props.pending || props.loading}
            getRowId={(item) => item.id}
            pageSizes={[10, 20, 25, 50, 100, 1000]}
            pagingData={{
                total: props.total,
                pageIndex: props.page,
                pageSize: props.pageSize,
            }}
            onPaginationChange={props.onPage}
            onSelectChange={props.onPageSize}
            onReorder={props.onReorder}
        />
    )
}
