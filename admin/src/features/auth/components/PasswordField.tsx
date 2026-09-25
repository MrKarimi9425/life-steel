import PasswordInput from '@/components/shared/PasswordInput'
import { FormItem } from '@/components/ui/Form'
import type { ChangeEventHandler, FocusEventHandler } from 'react'

interface PasswordFieldProps {
    error?: string
    onBlur: FocusEventHandler<HTMLInputElement>
    onChange: ChangeEventHandler<HTMLInputElement>
    showError: boolean
    value: string
}

export function PasswordField({
    error,
    showError,
    value,
    onBlur,
    onChange,
}: PasswordFieldProps) {
    return (
        <FormItem
            errorMessage={error}
            htmlFor="password"
            invalid={showError && Boolean(error)}
            label="رمز عبور"
        >
            <PasswordInput
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="رمز عبور"
                value={value}
                onBlur={onBlur}
                onChange={onChange}
            />
        </FormItem>
    )
}
