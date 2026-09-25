import MenuIcon from '@/assets/icons/iconsax/linear/menu.svg?react'
import classNames from '@/utils/classNames'
import type { CommonProps } from '@/components/ui/@types/common'

export interface NavToggleProps extends CommonProps {
    toggled?: boolean
}

const NavToggle = ({ className }: NavToggleProps) => {
    return (
        <div
            className={classNames(
                'inline-flex size-6 items-center justify-center leading-none',
                className,
            )}
        >
            <MenuIcon
                aria-hidden="true"
                focusable="false"
                height={24}
                width={24}
            />
        </div>
    )
}

export default NavToggle
