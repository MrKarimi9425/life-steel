import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import type { FocusEventHandler } from 'react'
import { normalizePhoneNumberInput } from '../utils/phone-number'

interface PhoneNumberFieldProps {
    error?: string
    onBlur: FocusEventHandler<HTMLInputElement>
    onChange: (value: string) => void
    showError: boolean
    value: string
}

export function PhoneNumberField({
    error,
    showError,
    value,
    onBlur,
    onChange,
}: PhoneNumberFieldProps) {
    return (
        <FormItem
            className="mb-7"
            errorMessage={error}
            htmlFor="phoneNumber"
            invalid={showError && Boolean(error)}
            label="شماره موبایل"
        >
            <Input
                autoComplete="tel-national"
                className="text-left"
                dir="ltr"
                id="phoneNumber"
                inputMode="numeric"
                maxLength={11}
                name="phoneNumber"
                placeholder="09123456789"
                type="tel"
                value={value}
                onBlur={onBlur}
                onChange={(event) =>
                    onChange(normalizePhoneNumberInput(event.target.value))
                }
            />
        </FormItem>
    )
}
