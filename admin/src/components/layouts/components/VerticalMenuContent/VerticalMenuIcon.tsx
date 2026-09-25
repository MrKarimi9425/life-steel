import type { SvgIcon } from '@/@types/icon'

interface VerticalMenuIconProps {
    icon: SvgIcon | null
}

const VerticalMenuIcon = ({ icon }: VerticalMenuIconProps) => {
    if (!icon) return null
    const Icon = icon

    return (
        <span className="inline-flex size-6 shrink-0 items-center justify-center leading-none">
            <Icon aria-hidden="true" focusable="false" />
        </span>
    )
}

export default VerticalMenuIcon
