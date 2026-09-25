import Select from '@/components/ui/Select'

export type RelationSelectOption = {
    value: string
    label: string
    description?: string
    badge?: string
}

type RelationMultiSelectProps = {
    options: RelationSelectOption[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    noOptionsText?: string
    isLoading?: boolean
}

export default function RelationMultiSelect({
    options,
    value,
    onChange,
    placeholder = 'جستجو و انتخاب کنید',
    noOptionsText = 'موردی پیدا نشد',
    isLoading = false,
}: RelationMultiSelectProps) {
    const selected = options.filter((option) => value.includes(option.value))

    return (
        <Select<RelationSelectOption, true>
            isMulti
            isClearable
            isSearchable
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            isLoading={isLoading}
            noOptionsMessage={() => noOptionsText}
            options={options}
            placeholder={placeholder}
            value={selected}
            formatOptionLabel={(option, meta) =>
                meta.context === 'value' ? (
                    option.label
                ) : (
                    <div className="flex min-w-0 items-center justify-between gap-3 py-0.5">
                        <div className="min-w-0">
                            <div className="truncate font-semibold text-gray-800 dark:text-gray-100">
                                {option.label}
                            </div>
                            {option.description && (
                                <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                    {option.description}
                                </div>
                            )}
                        </div>
                        {option.badge && (
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {option.badge}
                            </span>
                        )}
                    </div>
                )
            }
            onChange={(items) => onChange(items.map((item) => item.value))}
        />
    )
}
