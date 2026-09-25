export function parseIsoDate(value: string): Date | null {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return null

    const date = new Date(year, month - 1, day)

    return Number.isNaN(date.getTime()) ? null : date
}

export function formatIsoDate(value: Date | null): string {
    if (!value) return ''

    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}
