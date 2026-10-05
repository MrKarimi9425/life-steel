import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import Tag from '@/components/ui/Tag'
import type { SiteBanner } from '../site-content.types'

type Props = {
    items: SiteBanner[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    persianId?: string
    pending: boolean
    onEdit: (item: SiteBanner) => void
    onImage: (item: SiteBanner) => void
    onDelete: (item: SiteBanner) => void
    onPage: (page: number) => void
    onPageSize: (size: number) => void
    onReorder: (items: SiteBanner[]) => void
}

export default function BannersTable(props: Props) {
    const columns: ColumnDef<SiteBanner>[] = [
        {
            id: 'image',
            header: 'تصویر',
            cell: ({ row }) => {
                const translation = row.original.translations.find(
                    (item) => item.languageId === props.persianId,
                )
                return translation?.desktopImage?.path ? (
                    <img
                        alt=""
                        className="h-14 w-24 rounded-lg object-cover"
                        src={`/api/public/media/${translation.desktopImage.path}`}
                    />
                ) : (
                    <span className="text-xs text-gray-500">بدون تصویر</span>
                )
            },
        },
        {
            id: 'title',
            header: 'متن جایگزین',
            cell: ({ row }) =>
                row.original.translations.find(
                    (item) => item.languageId === props.persianId,
                )?.altText ?? row.original.translations[0]?.altText,
        },
        {
            id: 'status',
            header: 'وضعیت',
            cell: ({ row }) => (
                <Tag>{row.original.isPublished ? 'منتشر شده' : 'پیش نویس'}</Tag>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <TableActions>
                    <TableActionButton
                        icon={<GalleryIcon width={18} height={18} />}
                        label="تصاویر بنر"
                        tone="view"
                        onClick={() => props.onImage(row.original)}
                    />
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
