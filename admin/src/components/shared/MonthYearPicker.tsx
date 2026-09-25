import { forwardRef, useEffect, useMemo, useState } from 'react'
import moment from 'jalali-moment'
import BasePicker from '@/components/ui/DatePicker/BasePicker'
import Header from '@/components/ui/DatePicker/tables/Header'
import classNames from 'classnames'

interface MonthYearPickerProps {
    className?: string
    clearable?: boolean
    disabled?: boolean
    invalid?: boolean
    name?: string
    placeholder?: string
    value: Date | null
    onBlur?: () => void
    onChange: (value: Date | null) => void
}

const monthNames = Array.from({ length: 12 }, (_, month) =>
    moment().locale('fa').jYear(1400).jMonth(month).jDate(1).format('jMMMM'),
)

const persianNumber = new Intl.NumberFormat('fa-IR', {
    useGrouping: false,
})

const toJalaliParts = (value: Date) => {
    const date = moment(value)
    return { year: date.jYear(), month: date.jMonth() }
}

const fromJalaliParts = (year: number, month: number) =>
    moment(`${year}/${month + 1}/1`, 'jYYYY/jM/jD').toDate()

const MonthYearPicker = forwardRef<HTMLInputElement, MonthYearPickerProps>(
    (
        {
            className,
            clearable = true,
            disabled,
            invalid,
            name,
            placeholder = 'ماه و سال را انتخاب کنید',
            value,
            onBlur,
            onChange,
        },
        ref,
    ) => {
        const current = useMemo(
            () => toJalaliParts(value ?? new Date()),
            [value],
        )
        const [open, setOpen] = useState(false)
        const [view, setView] = useState<'month' | 'year'>('month')
        const [year, setYear] = useState(current.year)
        const [decade, setDecade] = useState(Math.floor(current.year / 10) * 10)

        useEffect(() => {
            setYear(current.year)
            setDecade(Math.floor(current.year / 10) * 10)
        }, [current.year])

        const selectMonth = (month: number) => {
            onChange(fromJalaliParts(year, month))
            setOpen(false)
            setView('month')
        }

        const selectYear = (selectedYear: number) => {
            setYear(selectedYear)
            setView('month')
        }

        const inputLabel = value
            ? moment(value).locale('fa').format('jMMMM jYYYY')
            : ''

        return (
            <BasePicker
                ref={ref}
                className={classNames(invalid && 'input-invalid', className)}
                clearable={clearable && Boolean(value)}
                disabled={disabled}
                dropdownOpened={open}
                inputLabel={inputLabel}
                name={name}
                placeholder={placeholder}
                setDropdownOpened={setOpen}
                onBlur={() => onBlur?.()}
                onClear={() => onChange(null)}
            >
                {view === 'month' ? (
                    <div className="month-picker">
                        <Header
                            hasNext
                            hasPrevious
                            label={persianNumber.format(year)}
                            nextLabel="سال بعد"
                            previousLabel="سال قبل"
                            onNext={() =>
                                setYear((currentYear) => currentYear + 1)
                            }
                            onPrevious={() =>
                                setYear((currentYear) => currentYear - 1)
                            }
                            onNextLevel={() => {
                                setDecade(Math.floor(year / 10) * 10)
                                setView('year')
                            }}
                        />
                        <div className="month-table">
                            {monthNames.map((monthName, month) => {
                                const active =
                                    value &&
                                    current.year === year &&
                                    current.month === month
                                return (
                                    <button
                                        key={monthName}
                                        className={classNames(
                                            'month-picker-cell',
                                            active
                                                ? 'month-picker-cell-active bg-primary'
                                                : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100',
                                        )}
                                        type="button"
                                        onClick={() => selectMonth(month)}
                                    >
                                        {monthName}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="year-picker">
                        <Header
                            hasNext
                            hasPrevious
                            nextLevelDisabled
                            label={`${persianNumber.format(decade)} - ${persianNumber.format(decade + 9)}`}
                            nextLabel="دهه بعد"
                            previousLabel="دهه قبل"
                            onNext={() => setDecade((value) => value + 10)}
                            onPrevious={() => setDecade((value) => value - 10)}
                        />
                        <div className="year-table">
                            {Array.from({ length: 10 }, (_, index) => {
                                const option = decade + index
                                return (
                                    <button
                                        key={option}
                                        className={classNames(
                                            'year-picker-cell',
                                            option === year
                                                ? 'year-picker-cell-active bg-primary'
                                                : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100',
                                        )}
                                        type="button"
                                        onClick={() => selectYear(option)}
                                    >
                                        {persianNumber.format(option)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </BasePicker>
        )
    },
)

MonthYearPicker.displayName = 'MonthYearPicker'

export default MonthYearPicker
