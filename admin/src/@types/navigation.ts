import type { SvgIcon } from './icon'

export interface NavigationTree {
    key: string
    path: string
    isExternalLink?: boolean
    title: string
    translateKey: string
    icon: SvgIcon | null
    type: 'title' | 'collapse' | 'item'
    authority: string[]
    accountTypes?: Array<'CUSTOMER' | 'STAFF'>
    subMenu: NavigationTree[]
}
