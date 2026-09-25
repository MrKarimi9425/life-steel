import TickCircleIcon from '@/assets/icons/iconsax/linear/tick-circle.svg?react'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import type {
    GroupBase,
    OptionProps as ReactSelectOptionProps,
} from 'react-select'

type DefaultOptionProps<T> = {
    customLabel?: (data: T, label: string) => ReactNode
}

const Option = <
    T,
    IsMulti extends boolean = false,
    Group extends GroupBase<T> = GroupBase<T>,
>(
    props: ReactSelectOptionProps<T, IsMulti, Group> & DefaultOptionProps<T>,
) => {
    const { innerProps, label, isSelected, isDisabled, data, customLabel } =
        props

    return (
        <div
            className={classNames(
                'select-option',
                !isDisabled &&
                    !isSelected &&
                    'hover:text-gray-800 hover:dark:text-gray-100',
                isSelected && 'bg-primary-subtle text-primary',
            )}
            {...innerProps}
        >
            {customLabel ? (
                customLabel(data, label)
            ) : (
                <span className="ml-2">{label}</span>
            )}
            {isSelected && (
                <TickCircleIcon
                    aria-hidden="true"
                    focusable="false"
                    className="text-primary"
                    height={20}
                    width={20}
                />
            )}
        </div>
    )
}

export default Option
