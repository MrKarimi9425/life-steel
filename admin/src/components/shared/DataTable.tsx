import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type SortingState,
} from '@tanstack/react-table'
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DropResult,
} from '@hello-pangea/dnd'
import classNames from 'classnames'
import MenuIcon from '@/assets/icons/iconsax/linear/menu.svg?react'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import Skeleton from '@/components/ui/Skeleton'
import Table from '@/components/ui/Table'
import type { TableProps } from '@/components/ui/Table'
import type { SkeletonProps } from '@/components/ui/Skeleton'
import { usePanelPreferencesStore } from '@/store/panelPreferencesStore'

export type OnSortParam = {
    order: 'asc' | 'desc' | ''
    key: string | number
}

interface DataTableProps<T> extends Pick<
    TableProps,
    'hoverable' | 'overflow' | 'className'
> {
    columns: ColumnDef<T>[]
    customNoDataIcon?: ReactNode
    data: T[]
    loading?: boolean
    noData?: boolean
    selectable?: boolean
    checkboxChecked?: (row: T) => boolean
    onCheckBoxChange?: (checked: boolean, row: T) => void
    onIndeterminateCheckBoxChange?: (checked: boolean, rows: Row<T>[]) => void
    onPaginationChange?: (page: number) => void
    onSelectChange?: (pageSize: number) => void
    onSort?: (sort: OnSortParam) => void
    pageSizes?: number[]
    paginate?: boolean
    skeletonAvatarColumns?: number[]
    skeletonAvatarProps?: SkeletonProps
    pagingData?: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onRowClick?: (row: T) => void
    rowClassName?: (row: T) => string
    draggable?: boolean
    dragDisabled?: boolean
    dragHandleLabel?: string
    getRowId?: (row: T) => string
    onReorder?: (data: T[], result: DropResult) => void
}

const { Sorter, TBody, Td, Th, THead, Tr } = Table

function DataTable<T>({
    columns,
    customNoDataIcon,
    data,
    loading = false,
    noData = data.length === 0,
    selectable = false,
    checkboxChecked,
    onCheckBoxChange,
    onIndeterminateCheckBoxChange,
    onPaginationChange,
    onSelectChange,
    onSort,
    pageSizes = [10, 25, 50, 100, 1000],
    paginate = true,
    skeletonAvatarColumns = [],
    skeletonAvatarProps,
    pagingData,
    hoverable,
    overflow,
    className,
    onRowClick,
    rowClassName,
    draggable = false,
    dragDisabled = false,
    dragHandleLabel = 'تغییر ترتیب',
    getRowId,
    onReorder,
}: DataTableProps<T>) {
    const defaultPageSize = usePanelPreferencesStore(
        (state) => state.defaultPageSize,
    )
    const tableDensity = usePanelPreferencesStore((state) => state.tableDensity)
    const supportsDefaultPageSize = pageSizes.includes(defaultPageSize)
    const [sorting, setSorting] = useState<SortingState>([])
    const dragDimensions = useRef<{
        id: string
        width: number
        cells: number[]
    } | null>(null)
    const [internalPage, setInternalPage] = useState(1)
    const [internalPageSize, setInternalPageSize] = useState(() =>
        supportsDefaultPageSize ? defaultPageSize : (pageSizes[0] ?? 10),
    )
    const onSortRef = useRef(onSort)
    const clientPagingData = {
        total: data.length,
        pageIndex: internalPage,
        pageSize: internalPageSize,
    }
    const effectivePagingData = pagingData ?? clientPagingData
    const visibleData = useMemo(
        () =>
            pagingData || !paginate
                ? data
                : data.slice(
                      (internalPage - 1) * internalPageSize,
                      internalPage * internalPageSize,
                  ),
        [data, internalPage, internalPageSize, paginate, pagingData],
    )
    const finalColumns: ColumnDef<T>[] = selectable
        ? [
              {
                  id: 'select',
                  maxSize: 50,
                  header: ({ table: currentTable }) => {
                      const rows = currentTable.getRowModel().rows
                      const selectedCount = rows.filter((row) =>
                          checkboxChecked?.(row.original),
                      ).length
                      const allSelected =
                          rows.length > 0 && selectedCount === rows.length
                      return (
                          <Checkbox
                              checked={allSelected}
                              className="mb-0"
                              indeterminate={selectedCount > 0 && !allSelected}
                              onChange={(checked) =>
                                  onIndeterminateCheckBoxChange?.(checked, rows)
                              }
                          />
                      )
                  },
                  cell: ({ row }) => (
                      <div onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                              checked={checkboxChecked?.(row.original) ?? false}
                              className="mb-0"
                              onChange={(checked) =>
                                  onCheckBoxChange?.(checked, row.original)
                              }
                          />
                      </div>
                  ),
              },
              ...columns,
          ]
        : columns
    const table = useReactTable({
        columns: finalColumns,
        data: visibleData,
        enableSorting: !draggable,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    })
    useEffect(() => {
        onSortRef.current = onSort
    }, [onSort])
    useEffect(() => {
        if (pagingData || !supportsDefaultPageSize) return

        setInternalPageSize(defaultPageSize)
        setInternalPage(1)
    }, [defaultPageSize, pagingData, supportsDefaultPageSize])
    useEffect(() => {
        if (pagingData) return
        const pageCount = Math.max(1, Math.ceil(data.length / internalPageSize))
        setInternalPage((page) => Math.min(page, pageCount))
    }, [data.length, internalPageSize, pagingData])
    useEffect(() => {
        const column = sorting[0]
        onSortRef.current?.({
            key: column?.id ?? '',
            order: column ? (column.desc ? 'desc' : 'asc') : '',
        })
    }, [sorting])
    const pageSizeOptions = pageSizes.map((pageSize) => ({
        label: `${pageSize} / صفحه`,
        value: pageSize,
    }))
    const handleDragEnd = (result: DropResult) => {
        if (
            dragDisabled ||
            !result.destination ||
            result.destination.index === result.source.index
        ) {
            return
        }

        const reorderedData = [...visibleData]
        const [movedItem] = reorderedData.splice(result.source.index, 1)
        if (!movedItem) return
        reorderedData.splice(result.destination.index, 0, movedItem)
        onReorder?.(reorderedData, result)
    }

    return (
        <>
            <DragDropContext
                onBeforeCapture={({ draggableId }) => {
                    const row = Array.from(
                        document.querySelectorAll<HTMLTableRowElement>(
                            '[data-drag-row-id]',
                        ),
                    ).find(
                        (candidate) =>
                            candidate.dataset.dragRowId === draggableId,
                    )
                    if (!row) return
                    dragDimensions.current = {
                        id: draggableId,
                        width: row.getBoundingClientRect().width,
                        cells: Array.from(row.cells).map(
                            (cell) => cell.getBoundingClientRect().width,
                        ),
                    }
                }}
                onDragEnd={handleDragEnd}
            >
                <Table
                    className={classNames(
                        'responsive-data-table',
                        className,
                        `table-density-${tableDensity}`,
                    )}
                    hoverable={hoverable}
                    overflow={overflow ?? true}
                >
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {draggable && <Th className="w-12" />}
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        className={classNames(
                                            header.column.id === 'actions' &&
                                                'sticky left-0 z-20 whitespace-nowrap bg-white dark:bg-gray-800',
                                        )}
                                        colSpan={header.colSpan}
                                        key={header.id}
                                        style={
                                            header.column.id === 'actions'
                                                ? { width: '1%' }
                                                : undefined
                                        }
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={classNames(
                                                    header.column.getCanSort() &&
                                                        'cursor-pointer select-none point',
                                                    loading &&
                                                        'pointer-events-none',
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    <Droppable
                        droppableId="data-table"
                        isDropDisabled={!draggable || dragDisabled}
                    >
                        {(droppableProvided) => (
                            <TBody
                                ref={droppableProvided.innerRef}
                                {...droppableProvided.droppableProps}
                            >
                                {loading ? (
                                    Array.from(
                                        {
                                            length: Math.min(
                                                effectivePagingData.pageSize,
                                                10,
                                            ),
                                        },
                                        (_, rowIndex) => (
                                            <Tr key={rowIndex}>
                                                {draggable && (
                                                    <Td data-label="ترتیب">
                                                        <Skeleton
                                                            height={20}
                                                            width={20}
                                                        />
                                                    </Td>
                                                )}
                                                {finalColumns.map(
                                                    (column, columnIndex) => {
                                                        const hasAvatar =
                                                            skeletonAvatarColumns.includes(
                                                                columnIndex,
                                                            )

                                                        return (
                                                            <Td
                                                                className={classNames(
                                                                    column.id ===
                                                                        'actions' &&
                                                                        'sticky left-0 z-10 whitespace-nowrap bg-white dark:bg-gray-800',
                                                                )}
                                                                data-column-id={
                                                                    column.id
                                                                }
                                                                data-label={
                                                                    column.id ===
                                                                    'select'
                                                                        ? 'انتخاب'
                                                                        : typeof column.header ===
                                                                            'string'
                                                                          ? column.header
                                                                          : ''
                                                                }
                                                                key={
                                                                    column.id ??
                                                                    columnIndex
                                                                }
                                                                style={
                                                                    column.id ===
                                                                    'actions'
                                                                        ? {
                                                                              width: '1%',
                                                                          }
                                                                        : undefined
                                                                }
                                                            >
                                                                <div
                                                                    className={classNames(
                                                                        hasAvatar &&
                                                                            'flex items-center gap-3',
                                                                    )}
                                                                >
                                                                    {hasAvatar && (
                                                                        <Skeleton
                                                                            height={
                                                                                40
                                                                            }
                                                                            width={
                                                                                40
                                                                            }
                                                                            {...skeletonAvatarProps}
                                                                            className={classNames(
                                                                                'shrink-0 rounded-full',
                                                                                skeletonAvatarProps?.className,
                                                                            )}
                                                                        />
                                                                    )}
                                                                    <Skeleton />
                                                                </div>
                                                            </Td>
                                                        )
                                                    },
                                                )}
                                            </Tr>
                                        ),
                                    )
                                ) : noData ? (
                                    <Tr>
                                        <Td
                                            className="hover:bg-transparent"
                                            colSpan={
                                                finalColumns.length +
                                                (draggable ? 1 : 0)
                                            }
                                            data-column-id="empty"
                                        >
                                            <div className="flex flex-col items-center gap-4 py-6">
                                                {customNoDataIcon}
                                                <span className="font-semibold">
                                                    هیچ داده ای پیدا نشد!
                                                </span>
                                            </div>
                                        </Td>
                                    </Tr>
                                ) : (
                                    table
                                        .getRowModel()
                                        .rows.map((row, index) => {
                                            const rowContent = (
                                                dragHandleProps?: Record<
                                                    string,
                                                    unknown
                                                >,
                                                dragging = false,
                                            ) => (
                                                <>
                                                    {draggable && (
                                                        <Td
                                                            data-label="ترتیب"
                                                            style={dragging ? { width: dragDimensions.current?.cells[0] } : undefined}
                                                        >
                                                            <button
                                                                {...dragHandleProps}
                                                                aria-label={
                                                                    dragHandleLabel
                                                                }
                                                                className="flex size-8 cursor-grab items-center justify-center text-gray-400 disabled:cursor-default disabled:opacity-40"
                                                                disabled={
                                                                    dragDisabled
                                                                }
                                                                type="button"
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    event.stopPropagation()
                                                                }
                                                            >
                                                                <MenuIcon
                                                                    height={20}
                                                                    width={20}
                                                                />
                                                            </button>
                                                        </Td>
                                                    )}
                                                    {row
                                                        .getVisibleCells()
                                                        .map((cell) => (
                                                            <Td
                                                                className={classNames(
                                                                    cell.column
                                                                        .id ===
                                                                        'actions' &&
                                                                        'sticky left-0 z-10 whitespace-nowrap bg-white dark:bg-gray-800',
                                                                )}
                                                                data-column-id={
                                                                    cell.column
                                                                        .id
                                                                }
                                                                data-label={
                                                                    cell.column
                                                                        .id ===
                                                                    'select'
                                                                        ? 'انتخاب'
                                                                        : typeof cell
                                                                                .column
                                                                                .columnDef
                                                                                .header ===
                                                                            'string'
                                                                          ? cell
                                                                                .column
                                                                                .columnDef
                                                                                .header
                                                                          : ''
                                                                }
                                                                key={cell.id}
                                                                style={dragging
                                                                    ? { width: dragDimensions.current?.cells[cell.column.getIndex() + 1] }
                                                                    : cell.column.id === 'actions'
                                                                      ? { width: '1%' }
                                                                      : { width: cell.column.getSize() }}
                                                            >
                                                                {flexRender(
                                                                    cell.column
                                                                        .columnDef
                                                                        .cell,
                                                                    cell.getContext(),
                                                                )}
                                                            </Td>
                                                        ))}
                                                </>
                                            )

                                            if (!draggable) {
                                                return (
                                                    <Tr
                                                        key={row.id}
                                                        className={rowClassName?.(
                                                            row.original,
                                                        )}
                                                        onClick={() =>
                                                            onRowClick?.(
                                                                row.original,
                                                            )
                                                        }
                                                    >
                                                        {rowContent()}
                                                    </Tr>
                                                )
                                            }

                                            const draggableId =
                                                getRowId?.(row.original) ??
                                                row.id
                                            return (
                                                <Draggable
                                                    key={draggableId}
                                                    draggableId={draggableId}
                                                    index={index}
                                                    isDragDisabled={
                                                        dragDisabled
                                                    }
                                                >
                                                    {(
                                                        draggableProvided,
                                                        snapshot,
                                                    ) => (
                                                        <Tr
                                                            ref={
                                                                draggableProvided.innerRef
                                                            }
                                                            {...draggableProvided.draggableProps}
                                                            data-drag-row-id={draggableId}
                                                            style={{
                                                                ...draggableProvided.draggableProps.style,
                                                                width: snapshot.isDragging && dragDimensions.current?.id === draggableId
                                                                    ? dragDimensions.current.width
                                                                    : undefined,
                                                            }}
                                                            className={classNames(
                                                                rowClassName?.(
                                                                    row.original,
                                                                ),
                                                                snapshot.isDragging &&
                                                                    'is-dragging',
                                                            )}
                                                            onClick={() =>
                                                                onRowClick?.(
                                                                    row.original,
                                                                )
                                                            }
                                                        >
                                                            {rowContent(
                                                                draggableProvided.dragHandleProps as unknown as Record<
                                                                    string,
                                                                    unknown
                                                                >,
                                                                snapshot.isDragging,
                                                            )}
                                                        </Tr>
                                                    )}
                                                </Draggable>
                                            )
                                        })
                                )}
                                {droppableProvided.placeholder}
                            </TBody>
                        )}
                    </Droppable>
                </Table>
            </DragDropContext>
            {paginate && effectivePagingData.total > 0 && (
                <div className="z-20 mt-auto flex w-full min-w-0 flex-col items-stretch gap-2 border-t border-gray-100 bg-white px-4 py-3 sm:sticky sm:bottom-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800">
                    <Pagination
                        className="mx-auto max-w-full sm:mx-0"
                        currentPage={effectivePagingData.pageIndex}
                        pageSize={effectivePagingData.pageSize}
                        total={effectivePagingData.total}
                        onChange={
                            pagingData ? onPaginationChange : setInternalPage
                        }
                    />
                    <div className="list-page-size-select w-full sm:w-36 sm:shrink-0">
                        <Select
                            isSearchable={false}
                            menuPlacement="top"
                            options={pageSizeOptions}
                            size="sm"
                            value={pageSizeOptions.find(
                                (option) =>
                                    option.value ===
                                    effectivePagingData.pageSize,
                            )}
                            onChange={(option) => {
                                const nextPageSize = option?.value ?? 10
                                if (pagingData) {
                                    onSelectChange?.(nextPageSize)
                                    return
                                }
                                setInternalPageSize(nextPageSize)
                                setInternalPage(1)
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export type { ColumnDef, Row }
export default DataTable
