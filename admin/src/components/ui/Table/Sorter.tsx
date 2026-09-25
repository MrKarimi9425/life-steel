import ArrowUp01Icon from '@/assets/icons/iconsax/linear/arrow-up-01.svg?react'
import ArrowDown01Icon from '@/assets/icons/iconsax/linear/arrow-down-01.svg?react'
import SortIcon from '@/assets/icons/iconsax/linear/sort.svg?react'
import classNames from '@/utils/classNames'

export interface SorterProps {
    className?: string
    sort?: boolean | 'asc' | 'desc'
}

const Sorter = ({ sort, className }: SorterProps) => {
    const icon =
        sort === 'asc' ? (
            <ArrowUp01Icon
                aria-hidden="true"
                focusable="false"
                className="text-primary"
                height={16}
                width={16}
            />
        ) : sort === 'desc' ? (
            <ArrowDown01Icon
                aria-hidden="true"
                focusable="false"
                className="text-primary"
                height={16}
                width={16}
            />
        ) : (
            <SortIcon
                aria-hidden="true"
                focusable="false"
                height={16}
                width={16}
            />
        )

    return <div className={classNames('inline-flex', className)}>{icon}</div>
}

export default Sorter
