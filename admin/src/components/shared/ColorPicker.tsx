import Input from '@/components/ui/Input'

type Props = {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export default function ColorPicker({ value, onChange, disabled }: Props) {
    const pickerValue = /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(value)
        ? value.slice(0, 7)
        : '#000000'

    return (
        <div className="flex min-w-0 items-center gap-2" dir="ltr">
            <Input
                type="color"
                aria-label="انتخاب رنگ"
                className="w-12 shrink-0 cursor-pointer p-1"
                value={pickerValue}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value.toUpperCase())}
            />
            <Input
                aria-label="کد رنگ انتخاب شده"
                className="min-w-0 flex-1 px-2 text-center"
                readOnly
                value={value.toUpperCase()}
                placeholder="HEX"
                disabled={disabled}
            />
        </div>
    )
}
