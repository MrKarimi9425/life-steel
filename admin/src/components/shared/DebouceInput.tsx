import { forwardRef } from 'react'
import Input from '@/components/ui/Input'
import useDebounce from '@/hooks/useDebounce'
import type { ChangeEvent } from 'react'
import type { InputProps } from '@/components/ui/Input'

type DebouceInputProps = InputProps & {
    wait?: number
}

const DebouceInput = forwardRef<HTMLInputElement, DebouceInputProps>(
    (props, ref) => {
        const { wait = 500, ...rest } = props
        const debounceFn = useDebounce(
            (value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                props.onChange?.(value),
            wait,
        )

        return (
            <Input
                ref={ref}
                {...rest}
                onChange={(event) => debounceFn(event)}
            />
        )
    },
)

DebouceInput.displayName = 'DebouceInput'

export default DebouceInput
