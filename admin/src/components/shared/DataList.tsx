import MenuIcon from '@/assets/icons/iconsax/linear/menu.svg?react'
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DraggableProvided,
    type DropResult,
} from '@hello-pangea/dnd'
import { useConfig } from '@/components/ui/ConfigProvider'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export interface DataListColumnDef<TData> {
    id: string
    className?: string
    render: (item: TData) => ReactNode
}

interface DataListProps<TData> {
    columns: DataListColumnDef<TData>[]
    data: TData[]
    draggable?: boolean
    dragDisabled?: boolean
    dragHandleLabel?: string
    getRowId: (item: TData) => string
    onReorder?: (data: TData[]) => void
    presentation?: 'rows' | 'mobile-cards'
}

export default function DataList<TData>({
    columns,
    data,
    draggable = false,
    dragDisabled = false,
    dragHandleLabel = 'تغییر ترتیب',
    getRowId,
    onReorder,
    presentation = 'rows',
}: DataListProps<TData>) {
    const { direction } = useConfig()
    const mobileCards = presentation === 'mobile-cards'
    const handleDragEnd = (result: DropResult) => {
        if (
            dragDisabled ||
            !result.destination ||
            result.destination.index === result.source.index
        ) {
            return
        }

        const reorderedData = [...data]
        const [movedItem] = reorderedData.splice(result.source.index, 1)
        reorderedData.splice(result.destination.index, 0, movedItem)
        onReorder?.(reorderedData)
    }

    // The clone and the resting row use the same markup and classes.
    const renderRow = (item: TData, provided: DraggableProvided) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            dir={direction}
            className={classNames(
                mobileCards
                    ? 'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-shadow dark:border-gray-700 dark:bg-gray-800 md:flex md:flex-row md:justify-between md:gap-4 md:rounded-none md:border-0 md:px-0 md:py-5'
                    : 'flex flex-col gap-4 bg-white py-5 transition-shadow dark:bg-gray-800 md:flex-row md:items-center md:justify-between',
            )}
        >
            {draggable && (
                <button
                    {...provided.dragHandleProps}
                    aria-label={dragHandleLabel}
                    className={classNames(
                        'cursor-grab text-xl text-gray-400 disabled:cursor-default disabled:opacity-40',
                        mobileCards &&
                            'flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 md:size-auto md:rounded-none md:bg-transparent dark:bg-gray-700 dark:md:bg-transparent',
                    )}
                    disabled={dragDisabled}
                    type="button"
                >
                    <MenuIcon aria-hidden="true" focusable="false" height={20} width={20} />
                </button>
            )}
            {columns.map((column) => (
                <div key={column.id} className={column.className}>
                    {column.render(item)}
                </div>
            ))}
        </div>
    )

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
                droppableId="data-list"
                renderClone={(provided, _snapshot, rubric) =>
                    renderRow(data[rubric.source.index], provided)
                }
            >
                {(droppableProvided) => (
                    <div
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        className={classNames(
                            mobileCards
                                ? 'flex flex-col gap-2.5 md:block md:divide-y md:divide-gray-200 dark:md:divide-gray-700'
                                : 'divide-y divide-gray-200 dark:divide-gray-700',
                        )}
                    >
                        {data.map((item, index) => {
                            const rowId = getRowId(item)

                            return (
                                <Draggable
                                    key={rowId}
                                    draggableId={rowId}
                                    index={index}
                                    isDragDisabled={!draggable || dragDisabled}
                                >
                                    {(provided) => renderRow(item, provided)}
                                </Draggable>
                            )
                        })}
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
