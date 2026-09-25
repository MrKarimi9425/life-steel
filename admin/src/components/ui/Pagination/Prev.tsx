import ArrowLeft02Icon from '@/assets/icons/iconsax/linear/arrow-left-02.svg?react'
import classNames from 'classnames'
import type { MouseEvent } from 'react'

type PagerClass = {
    default: string
    inactive: string
    active: string
    disabled: string
}

const Prev = ({
    currentPage,
    pagerClass,
    onPrev,
}: {
    currentPage: number
    pagerClass: PagerClass
    onPrev: (event: MouseEvent<HTMLSpanElement>) => void
}) => {
    const disabled = currentPage <= 1

    return (
        <span
            className={classNames(
                pagerClass.default,
                'pagination-pager-prev',
                disabled ? pagerClass.disabled : pagerClass.inactive,
            )}
            role="presentation"
            onClick={(event) => {
                if (!disabled) onPrev(event)
            }}
        >
            <ArrowLeft02Icon
                aria-hidden="true"
                focusable="false"
                height={18}
                width={18}
            />
        </span>
    )
}

export default Prev
