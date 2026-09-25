import { useState, useEffect, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import ArrowLeftIcon from '@/assets/icons/iconsax/linear/arrow-left-01.svg?react'
import ArrowRightIcon from '@/assets/icons/iconsax/linear/arrow-right-01.svg?react'
import MoreIcon from '@/assets/icons/iconsax/linear/more.svg?react'

const PAGER_COUNT = 7
type More = 'nextMore' | 'prevMore'
type PagerClass = {
    default: string
    inactive: string
    active: string
    disabled: string
}

const MorePager = ({
    direction,
    className,
    onArrow,
}: {
    direction: More
    className: string
    onArrow: (more: More) => void
}) => {
    const [showArrow, setShowArrow] = useState(false)
    return (
        <li
            className={className}
            role="presentation"
            onClick={() => onArrow(direction)}
            onMouseEnter={() => setShowArrow(true)}
            onMouseLeave={() => setShowArrow(false)}
        >
            {showArrow ? (
                direction === 'nextMore' ? (
                    <ArrowRightIcon height={16} width={16} />
                ) : (
                    <ArrowLeftIcon height={16} width={16} />
                )
            ) : (
                <MoreIcon height={16} width={16} />
            )}
        </li>
    )
}

const Pagers = ({
    pageCount,
    currentPage,
    onChange,
    pagerClass,
}: {
    pageCount: number
    currentPage: number
    pagerClass: PagerClass
    onChange: (page: number) => void
}) => {
    const [showPrevMore, setShowPrevMore] = useState(false)
    const [showNextMore, setShowNextMore] = useState(false)

    useEffect(() => {
        if (pageCount > PAGER_COUNT) {
            setShowPrevMore(currentPage > PAGER_COUNT - 2)
            setShowNextMore(currentPage < pageCount - 2)
            if (currentPage >= pageCount - 3) setShowNextMore(false)
            if (currentPage <= 4) setShowPrevMore(false)
        } else {
            setShowPrevMore(false)
            setShowNextMore(false)
        }
    }, [currentPage, pageCount])

    const onArrowClick = useCallback(
        (more: More) =>
            onChange(more === 'nextMore' ? currentPage + 5 : currentPage - 5),
        [currentPage, onChange],
    )
    const pages = useMemo(() => {
        const result: number[] = []
        if (showPrevMore && !showNextMore) {
            for (let page = pageCount - 5; page < pageCount; page++) {
                result.push(page)
            }
        } else if (!showPrevMore && showNextMore) {
            for (let page = 2; page < PAGER_COUNT; page++) result.push(page)
        } else if (showPrevMore && showNextMore) {
            const offset = Math.floor(PAGER_COUNT / 2) - 1
            for (
                let page = currentPage - offset;
                page <= currentPage + offset;
                page++
            ) {
                result.push(page)
            }
        } else {
            for (let page = 2; page < pageCount; page++) result.push(page)
        }
        return result.length > PAGER_COUNT ? [] : result
    }, [showPrevMore, showNextMore, currentPage, pageCount])
    const getPagerClass = (page: number) =>
        classNames(
            pagerClass.default,
            currentPage === page ? pagerClass.active : pagerClass.inactive,
        )

    return (
        <ul>
            {pageCount > 0 && (
                <li
                    className={getPagerClass(1)}
                    role="presentation"
                    onClick={() => onChange(1)}
                >
                    1
                </li>
            )}
            {showPrevMore && (
                <MorePager
                    className={classNames(
                        pagerClass.default,
                        pagerClass.inactive,
                    )}
                    direction="prevMore"
                    onArrow={onArrowClick}
                />
            )}
            {pages.map((page) => (
                <li
                    className={getPagerClass(page)}
                    key={page}
                    role="presentation"
                    onClick={() => onChange(page)}
                >
                    {page}
                </li>
            ))}
            {showNextMore && (
                <MorePager
                    className={classNames(
                        pagerClass.default,
                        pagerClass.inactive,
                    )}
                    direction="nextMore"
                    onArrow={onArrowClick}
                />
            )}
            {pageCount > 1 && (
                <li
                    className={getPagerClass(pageCount)}
                    role="presentation"
                    onClick={() => onChange(pageCount)}
                >
                    {pageCount}
                </li>
            )}
        </ul>
    )
}

export default Pagers
