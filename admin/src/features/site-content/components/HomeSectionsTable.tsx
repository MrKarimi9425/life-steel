import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import EyeIcon from '@/assets/icons/iconsax/linear/eye.svg?react'
import EyeSlashIcon from '@/assets/icons/iconsax/linear/eye-slash.svg?react'
import Tag from '@/components/ui/Tag'
import { homeSectionLabels, type HomeSection } from '../site-content.types'

type Props = {
    items: HomeSection[]
    loading: boolean
    pending: boolean
    onStatus: (item: HomeSection) => void
    onReorder: (items: HomeSection[]) => void
}

export default function HomeSectionsTable(props: Props) {
    const columns: ColumnDef<HomeSection>[] = [
        {
            id: 'title',
            header: 'بخش',
            cell: ({ row }) => (
                <div>
                    <strong className="block text-gray-900 dark:text-gray-100">
                        {row.original.title ??
                            homeSectionLabels[row.original.type]}
                    </strong>
                    <span className="mt-1 block text-xs text-gray-500">
                        {row.original.type === 'HERO'
                            ? 'همیشه اولین بخش'
                            : homeSectionLabels[row.original.type]}
                    </span>
                </div>
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
            cell: ({ row }) =>
                row.original.type === 'HERO' ? null : (
                    <TableActions>
                        <TableActionButton
                            icon={
                                row.original.isActive ? (
                                    <EyeSlashIcon width={18} height={18} />
                                ) : (
                                    <EyeIcon width={18} height={18} />
                                )
                            }
                            label={
                                row.original.isActive
                                    ? 'غیرفعال کردن'
                                    : 'فعال کردن'
                            }
                            tone={row.original.isActive ? 'edit' : 'success'}
                            onClick={() => props.onStatus(row.original)}
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
            isRowDragDisabled={(item) => item.type === 'HERO'}
            getRowId={(item) => item.id}
            paginate={false}
            onReorder={props.onReorder}
        />
    )
}
