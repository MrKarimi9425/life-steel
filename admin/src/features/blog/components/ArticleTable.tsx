import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import FolderIcon from '@/assets/icons/iconsax/linear/folder-2.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import TableActionButton from '@/components/shared/TableActionButton'
import TableActions from '@/components/shared/TableActions'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import type { ArticleListItem } from '../blog.types'

type Props = {
    articles: ArticleListItem[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    articleTitle: (article: ArticleListItem) => string
    onAction: (kind: 'form' | 'gallery', articleId: string) => void
    onArchive: (articleId: string) => void
    onDelete: (articleId: string) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onReorder: (articles: ArticleListItem[]) => void
    reorderPending: boolean
}

const statusLabels = {
    DRAFT: 'پیش نویس',
    PUBLISHED: 'منتشر شده',
    ARCHIVED: 'بایگانی',
}

export default function ArticleTable({
    articles,
    loading,
    total,
    page,
    pageSize,
    articleTitle,
    onAction,
    onArchive,
    onDelete,
    onPageChange,
    onPageSizeChange,
    onReorder,
    reorderPending,
}: Props) {
    const columns: ColumnDef<ArticleListItem>[] = [
        {
            header: 'عنوان',
            id: 'title',
            cell: ({ row }) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {articleTitle(row.original)}
                </span>
            ),
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
                    <TableActionButton
                        icon={<EditIcon height={18} width={18} />}
                        label="ویرایش مقاله"
                        tone="edit"
                        onClick={() => onAction('form', row.original.id)}
                    />
                    <TableActionButton
                        icon={<GalleryIcon height={18} width={18} />}
                        label="گالری مقاله"
                        tone="success"
                        onClick={() => onAction('gallery', row.original.id)}
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
            data={articles}
            draggable
            dragDisabled={loading || reorderPending}
            getRowId={(article) => article.id}
            loading={loading}
            pageSizes={[10, 20, 25, 50, 100, 1000]}
            pagingData={{ total, pageIndex: page, pageSize }}
            onPaginationChange={onPageChange}
            onSelectChange={onPageSizeChange}
            onReorder={onReorder}
        />
    )
}
