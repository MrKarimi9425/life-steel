import SearchNormalIcon from '@/assets/icons/iconsax/linear/search-normal.svg?react'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import type { CommonProps } from '@/@types/common'

const _Search = ({ className }: CommonProps) => (
    <div className={className} role="button" aria-label="جستجو">
        <SearchNormalIcon aria-hidden="true" focusable="false" />
    </div>
)

const Search = withHeaderItem(_Search)

export default Search
