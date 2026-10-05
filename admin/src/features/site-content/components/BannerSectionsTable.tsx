import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import Tag from '@/components/ui/Tag'
import {
    homeSectionLabels,
    siteSectionPageLabels,
    type HomeSection,
} from '../site-content.types'

const isCustomSection = (item: HomeSection) =>
    item.page === 'HOME' && ['BANNER_FULL', 'BANNER_SPLIT'].includes(item.type)

type Props = {
    items: HomeSection[]
    loading: boolean
    onManage: (item: HomeSection) => void
    onEdit: (item: HomeSection) => void
    onDelete: (item: HomeSection) => void
}

export default function BannerSectionsTable(props: Props) {
    const columns: ColumnDef<HomeSection>[] = [
        {
            id: 'title',
            header: 'بخش بنر',
            cell: ({ row }) => (
                <div>
                    <strong className="block text-gray-900 dark:text-gray-100">
                        {row.original.title ??
                            homeSectionLabels[row.original.type]}
                    </strong>
                    <span className="mt-1 block text-xs text-gray-500">
                        {homeSectionLabels[row.original.type]}
                    </span>
                </div>
            ),
        },
        {
            id: 'banners',
            header: 'بنرها',
            cell: ({ row }) => {
                const limit =
                    row.original.type === 'BANNER_FULL'
                        ? 1
                        : row.original.type === 'BANNER_SPLIT'
                          ? 2
                          : null
                return limit
                    ? `${row.original.banners.length} از ${limit}`
                    : `${row.original.banners.length} اسلاید`
            },
        },
        {
            id: 'page',
            header: 'محل نمایش',
            cell: ({ row }) => siteSectionPageLabels[row.original.page],
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
                        icon={<GalleryIcon width={18} height={18} />}
                        label="مدیریت بنرها"
                        tone="view"
                        onClick={() => props.onManage(row.original)}
                    />
                    {isCustomSection(row.original) && (
                        <>
                            <TableActionButton
                                icon={<EditIcon width={18} height={18} />}
                                label="ویرایش بخش"
                                tone="edit"
                                onClick={() => props.onEdit(row.original)}
                            />
                            <TableActionButton
                                icon={<TrashIcon width={18} height={18} />}
                                label="حذف دائمی بخش"
                                tone="danger"
                                onClick={() => props.onDelete(row.original)}
                            />
                        </>
                    )}
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
            paginate={false}
        />
    )
}
