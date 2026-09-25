import ArrowRight02Icon from '@/assets/icons/iconsax/linear/arrow-right-02.svg?react'
import classNames from 'classnames'
import type { MouseEvent } from 'react'

type PagerClass = {
    default: string
    inactive: string
    active: string
    disabled: string
}

const Next = ({
    currentPage,
    pageCount,
    pagerClass,
    onNext,
}: {
    currentPage: number
    pageCount: number
    pagerClass: PagerClass
    onNext: (event: MouseEvent<HTMLSpanElement>) => void
}) => {
    const disabled = currentPage === pageCount || pageCount === 0

    return (
        <span
            className={classNames(
                pagerClass.default,
                'pagination-pager-next',
                disabled ? pagerClass.disabled : pagerClass.inactive,
            )}
            role="presentation"
            onClick={(event) => {
                event.preventDefault()
                if (!disabled) onNext(event)
            }}
        >
            <ArrowRight02Icon
                aria-hidden="true"
                focusable="false"
                height={18}
                width={18}
            />
        </span>
    )
}

export default Next
