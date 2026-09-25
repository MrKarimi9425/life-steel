import Avatar from '@/components/ui/Avatar'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import type { CommonProps } from '@/@types/common'

const _LanguageSelector = ({ className }: CommonProps) => (
    <div className={`${className ?? ''} flex items-center`}>
        <Avatar size={24} shape="circle" src="/img/countries/FA.png" />
    </div>
)

const LanguageSelector = withHeaderItem(_LanguageSelector)

export default LanguageSelector
