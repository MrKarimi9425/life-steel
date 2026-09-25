export type Language = {
    id: string
    code: string
    name: string
    nativeName: string
    direction: 'RTL' | 'LTR'
    isDefault: boolean
    isActive: boolean
    isRequiredForPublish: boolean
    displayOrder: number
}
