const persianDigits = '۰۱۲۳۴۵۶۷۸۹'

export function normalizeDigits(value: string): string {
    return value.replace(/[۰-۹]/g, (digit) =>
        String(persianDigits.indexOf(digit)),
    )
}

export function normalizePhoneNumberInput(value: string): string {
    return normalizeDigits(value).trim()
}

export function toBackendPhoneNumber(value: string): string {
    const localPhoneNumber = normalizePhoneNumberInput(value)
    return `+98${localPhoneNumber.slice(1)}`
}

export function toLocalPhoneNumber(value: string): string {
    const phoneNumber = normalizePhoneNumberInput(value)

    if (phoneNumber.startsWith('+98')) {
        return `0${phoneNumber.slice(3)}`
    }

    if (phoneNumber.startsWith('0098')) {
        return `0${phoneNumber.slice(4)}`
    }

    if (phoneNumber.startsWith('98') && phoneNumber.length === 12) {
        return `0${phoneNumber.slice(2)}`
    }

    if (phoneNumber.startsWith('9') && phoneNumber.length === 10) {
        return `0${phoneNumber}`
    }

    return phoneNumber
}
