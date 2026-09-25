import MoreIcon from '@/assets/icons/iconsax/linear/more.svg?react'
import Button from '@/components/ui/Button'
import type { ButtonProps } from '@/components/ui/Button'

type EllipsisButtonProps = ButtonProps

const EllipsisButton = (props: EllipsisButtonProps) => {
    const { shape = 'circle', variant = 'plain', size = 'xs' } = props

    return (
        <Button
            shape={shape}
            variant={variant}
            size={size}
            icon={
                <MoreIcon
                    aria-hidden="true"
                    focusable="false"
                    height={18}
                    width={18}
                />
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-gray-100 text-gray-600 shadow-none hover:bg-gray-200! hover:!text-gray-700"
            {...props}
        />
    )
}

export default EllipsisButton
