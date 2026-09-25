import moment from 'jalali-moment'

type IsDisabledParams = {
    date: Date
    minDate?: Date
    maxDate?: Date
    disableDate?(date: Date): boolean
    disableOutOfMonth?: boolean
    outOfMonth?: boolean
    monthNumber: number
}

export default function isDisabled({ date, monthNumber }: IsDisabledParams) {
    // تبدیل تاریخ ورودی به تاریخ شمسی
    const monthV = Number(moment(date).locale('fa').format('MM'))

    if (monthNumber == monthV) {
        return false
    } else {
        return true
    }
}
