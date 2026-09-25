import { forwardRef, useState } from 'react'
import EyeIcon from '@/assets/icons/iconsax/linear/eye.svg?react'
import EyeSlashIcon from '@/assets/icons/iconsax/linear/eye-slash.svg?react'
import { Input, type InputProps } from '@/components/ui/Input'
import type { MouseEvent } from 'react'

interface PasswordInputProps extends InputProps {
    onVisibleChange?: (visible: boolean) => void
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    (props, ref) => {
        const { onVisibleChange, ...rest } = props
        const [inputType, setInputType] = useState('password')

        const handleVisibilityClick = (event: MouseEvent<HTMLSpanElement>) => {
            event.preventDefault()
            const nextType = inputType === 'password' ? 'text' : 'password'
            setInputType(nextType)
            onVisibleChange?.(nextType === 'text')
        }

        return (
            <Input
                {...rest}
                ref={ref}
                suffix={
                    <span
                        className="inline-flex size-6 cursor-pointer items-center justify-center leading-none text-xl select-none"
                        role="button"
                        onClick={handleVisibilityClick}
                    >
                        {inputType === 'password' ? (
                            <EyeSlashIcon height={18} width={18} />
                        ) : (
                            <EyeIcon height={18} width={18} />
                        )}
                    </span>
                }
                type={inputType}
            />
        )
    },
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
