import ClockIcon from '@/assets/icons/iconsax/linear/clock.svg?react'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import Button from '../Button'
import ScrollBar from '../ScrollBar'
import BasePicker from '../DatePicker/BasePicker'
import useControllableState from '../hooks/useControllableState'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type { FocusEvent } from 'react'

export interface TimePickerProps extends CommonProps {
    clearable?: boolean
    defaultValue?: string | null
    disabled?: boolean
    minuteStep?: number
    name?: string
    placeholder?: string
    size?: TypeAttributes.ControlSize
    value?: string | null
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void
    onChange?: (value: string | null) => void
}

const hours = Array.from({ length: 24 }, (_, index) => index)

const pad = (value: number) => value.toString().padStart(2, '0')
const formatTime = (hour: number, minute: number) =>
    `${pad(hour)}:${pad(minute)}`

function parseTime(value?: string | null): {
    hour: number
    minute: number
} | null {
    if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
    const [hour, minute] = value.split(':').map(Number)
    return { hour, minute }
}

function clampMinuteStep(value: number): number {
    if (!Number.isInteger(value)) return 5
    return Math.min(30, Math.max(1, value))
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
    (
        {
            className,
            clearable = false,
            defaultValue = null,
            disabled = false,
            minuteStep = 5,
            name,
            placeholder = 'ساعت را انتخاب کنید',
            size,
            value,
            onBlur,
            onChange,
        },
        ref,
    ) => {
        const [_value, setValue] = useControllableState<string | null>({
            prop: value,
            defaultProp: defaultValue,
            onChange,
        })
        const [opened, setOpened] = useState(false)
        const parsedValue = useMemo(() => parseTime(_value), [_value])
        const [selectedHour, setSelectedHour] = useState(parsedValue?.hour ?? 0)
        const [selectedMinute, setSelectedMinute] = useState(
            parsedValue?.minute ?? 0,
        )
        const selectedHourRef = useRef<HTMLButtonElement>(null)
        const selectedMinuteRef = useRef<HTMLButtonElement>(null)
        const safeStep = clampMinuteStep(minuteStep)
        const minutes = useMemo(() => {
            const values = Array.from(
                { length: Math.ceil(60 / safeStep) },
                (_, index) => index * safeStep,
            ).filter((minute) => minute < 60)
            if (parsedValue && !values.includes(parsedValue.minute)) {
                values.push(parsedValue.minute)
                values.sort((left, right) => left - right)
            }
            return values
        }, [parsedValue, safeStep])

        useEffect(() => {
            if (!parsedValue) return
            setSelectedHour(parsedValue.hour)
            setSelectedMinute(parsedValue.minute)
        }, [parsedValue])

        useEffect(() => {
            if (!opened) return
            window.requestAnimationFrame(() => {
                selectedHourRef.current?.scrollIntoView({ block: 'center' })
                selectedMinuteRef.current?.scrollIntoView({ block: 'center' })
            })
        }, [opened])

        const selectHour = (hour: number) => {
            setSelectedHour(hour)
            setValue(formatTime(hour, selectedMinute))
        }

        const selectMinute = (minute: number) => {
            setSelectedMinute(minute)
            setValue(formatTime(selectedHour, minute))
            setOpened(false)
        }

        const selectCurrentTime = () => {
            const now = new Date()
            const roundedMinute =
                Math.round(now.getMinutes() / safeStep) * safeStep
            const hour =
                roundedMinute === 60
                    ? (now.getHours() + 1) % 24
                    : now.getHours()
            const minute = roundedMinute === 60 ? 0 : roundedMinute
            setSelectedHour(hour)
            setSelectedMinute(minute)
            setValue(formatTime(hour, minute))
            setOpened(false)
        }

        return (
            <BasePicker
                ref={ref}
                className={className}
                clearable={clearable && Boolean(_value) && !disabled}
                disabled={disabled}
                dropdownOpened={opened}
                inputLabel={_value ?? ''}
                inputSuffix={
                    <ClockIcon
                        aria-hidden="true"
                        focusable="false"
                        height={18}
                        width={18}
                    />
                }
                name={name}
                placeholder={placeholder}
                setDropdownOpened={setOpened}
                size={size}
                onBlur={onBlur}
                onClear={() => setValue(null)}
            >
                <div className="w-70 select-none" dir="rtl">
                    <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-500">
                            انتخاب ساعت
                        </span>
                        <span
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-lg font-bold text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                            dir="ltr"
                        >
                            {formatTime(selectedHour, selectedMinute)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2" dir="ltr">
                        <TimeColumn
                            items={hours}
                            label="ساعت"
                            selected={selectedHour}
                            selectedRef={selectedHourRef}
                            onSelect={selectHour}
                        />
                        <TimeColumn
                            items={minutes}
                            label="دقیقه"
                            selected={selectedMinute}
                            selectedRef={selectedMinuteRef}
                            onSelect={selectMinute}
                        />
                    </div>
                    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                        <Button
                            className="w-full"
                            size="sm"
                            type="button"
                            variant="plain"
                            onClick={selectCurrentTime}
                        >
                            انتخاب ساعت فعلی
                        </Button>
                    </div>
                </div>
            </BasePicker>
        )
    },
)

TimePicker.displayName = 'TimePicker'

function TimeColumn({
    items,
    label,
    selected,
    selectedRef,
    onSelect,
}: {
    items: number[]
    label: string
    selected: number
    selectedRef: React.RefObject<HTMLButtonElement | null>
    onSelect: (value: number) => void
}) {
    return (
        <div>
            <div className="mb-2 text-center text-xs font-semibold text-gray-500">
                {label}
            </div>
            <ScrollBar className="h-52 rounded-xl bg-gray-50 p-1 dark:bg-gray-800">
                <div className="grid grid-cols-2 gap-1 p-1">
                    {items.map((item) => {
                        const active = item === selected
                        return (
                            <button
                                key={item}
                                ref={active ? selectedRef : undefined}
                                aria-label={`${label} ${pad(item)}`}
                                aria-pressed={active}
                                className={classNames(
                                    'rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors',
                                    active
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700',
                                )}
                                type="button"
                                onClick={() => onSelect(item)}
                            >
                                {pad(item)}
                            </button>
                        )
                    })}
                </div>
            </ScrollBar>
        </div>
    )
}

export default TimePicker
