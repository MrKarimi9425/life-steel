import Input from '@/components/ui/Input'
import type { InputProps } from '@/components/ui/Input'

type MoneyInputProps = Omit<
    InputProps,
    'inputMode' | 'onChange' | 'suffix' | 'type' | 'value'
> & {
    value: string | number | null | undefined
    onValueChange: (value: string) => void
    maxDigits?: number
}

const formatter = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 0,
    useGrouping: true,
})

const normalizeDigits = (value: string) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/\D/g, '')

const formatValue = (value: MoneyInputProps['value']) => {
    const normalized = normalizeDigits(String(value ?? ''))
    return normalized ? formatter.format(Number(normalized)) : ''
}

export default function MoneyInput({
    value,
    onValueChange,
    maxDigits = 15,
    ...props
}: MoneyInputProps) {
    return (
        <Input
            {...props}
            dir="ltr"
            inputMode="numeric"
            suffix={<span className="whitespace-nowrap">تومان</span>}
            value={formatValue(value)}
            onChange={(event) =>
                onValueChange(
                    normalizeDigits(event.target.value).slice(0, maxDigits),
                )
            }
        />
    )
}
