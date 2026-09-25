import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import _DatePicker, { DatePickerProps } from './DatePicker'

export type { DatePickerProps } from './DatePicker'

type CompoundedComponent = ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLSpanElement>
>

const DatePicker = _DatePicker as CompoundedComponent

export { DatePicker }

export default DatePicker
