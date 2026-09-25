import SearchNormalIcon from '@/assets/icons/iconsax/linear/search-normal.svg?react'
import DebouceInput from './DebouceInput'

export default function ListSearchInput({
    defaultValue,
    placeholder,
    onSearch,
}: {
    defaultValue?: string
    placeholder: string
    onSearch: (value: string) => void
}) {
    return (
        <DebouceInput
            className="w-full min-w-0"
            defaultValue={defaultValue}
            placeholder={placeholder}
            suffix={
                <SearchNormalIcon
                    aria-hidden="true"
                    focusable="false"
                    height={18}
                    width={18}
                />
            }
            onChange={(event) => onSearch(event.target.value)}
        />
    )
}
