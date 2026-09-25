import { useState, useEffect, useMemo } from 'react'
import Pager from './Pagers'
import Prev from './Prev'
import Next from './Next'
import useControllableState from '../hooks/useControllableState'
import classNames from 'classnames'
import type { CommonProps } from '../@types/common'

export interface PaginationProps extends CommonProps {
    currentPage?: number
    displayTotal?: boolean
    onChange?: (pageNumber: number) => void
    pageSize?: number
    total?: number
}

const defaultTotal = 5

const Pagination = (props: PaginationProps) => {
    const {
        className,
        currentPage = 1,
        onChange,
        pageSize = 1,
        total = 5,
    } = props

    const [paginationTotal] = useControllableState({
        prop: total,
        defaultProp: defaultTotal,
        onChange,
    })
    const [internalPageSize, setInternalPageSize] = useState(pageSize)
    const pageCount = useMemo(() => {
        if (typeof paginationTotal === 'number') {
            return Math.ceil(paginationTotal / internalPageSize)
        }
        return 0
    }, [paginationTotal, internalPageSize])
    const getValidCurrentPage = (count: number | string) => {
        const value = parseInt(count as string, 10)
        let resetValue

        if (!pageCount) {
            if (isNaN(value) || value < 1) resetValue = 1
        } else {
            if (value < 1) resetValue = 1
            if (value > pageCount) resetValue = pageCount
        }

        if ((resetValue === undefined && isNaN(value)) || resetValue === 0) {
            resetValue = 1
        }

        return resetValue === undefined ? value : resetValue
    }
    const [internalCurrentPage, setInternalCurrentPage] = useState(
        currentPage ? getValidCurrentPage(currentPage) : 1,
    )

    useEffect(() => {
        if (pageSize !== internalPageSize) setInternalPageSize(pageSize)
        if (currentPage !== internalCurrentPage) {
            setInternalCurrentPage(currentPage)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize, currentPage])

    const changePage = (page: number) => {
        const validPage = getValidCurrentPage(page)
        setInternalCurrentPage(validPage)
        onChange?.(validPage)
    }
    const pagerClass = {
        default: 'pagination-pager',
        inactive: 'pagination-pager-inactive',
        active: 'pagination-pager-active',
        disabled: 'pagination-pager-disabled',
    }

    return (
        <div className={classNames('pagination', className)}>
            <Prev
                currentPage={internalCurrentPage}
                pagerClass={pagerClass}
                onPrev={() => changePage(internalCurrentPage - 1)}
            />
            <Pager
                currentPage={internalCurrentPage}
                pageCount={pageCount}
                pagerClass={pagerClass}
                onChange={changePage}
            />
            <Next
                currentPage={internalCurrentPage}
                pageCount={pageCount}
                pagerClass={pagerClass}
                onNext={() => changePage(internalCurrentPage + 1)}
            />
        </div>
    )
}

Pagination.displayName = 'Pagination'

export default Pagination
