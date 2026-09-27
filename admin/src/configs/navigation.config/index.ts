import type { NavigationTree } from '@/@types/navigation'
import CategoryIcon from '@/assets/icons/iconsax/bulk/category.svg?react'
import HomeIcon from '@/assets/icons/iconsax/bulk/home-2.svg?react'
import PeopleIcon from '@/assets/icons/iconsax/bulk/people.svg?react'
import SettingIcon from '@/assets/icons/iconsax/bulk/setting-2.svg?react'

const navigationConfig: NavigationTree[] = [
    {
        key: 'overview',
        path: '',
        title: 'داشبورد',
        translateKey: '',
        icon: null,
        type: 'title',
        authority: [],
        subMenu: [
            {
                key: 'dashboard',
                path: '/',
                title: 'داشبورد',
                translateKey: '',
                icon: HomeIcon,
                type: 'item',
                authority: [],
                subMenu: [],
            },
        ],
    },
    {
        key: 'catalog',
        path: '',
        title: 'کاتالوگ',
        translateKey: '',
        icon: null,
        type: 'title',
        authority: [],
        subMenu: [
            {
                key: 'catalog-management',
                path: '',
                title: 'محصولات',
                translateKey: '',
                icon: CategoryIcon,
                type: 'collapse',
                authority: [],
                subMenu: [
                    {
                        key: 'products',
                        path: '/products',
                        title: 'فهرست محصولات',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'product-categories',
                        path: '/product-categories',
                        title: 'دسته بندی ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'product-attributes',
                        path: '/product-attributes',
                        title: 'ویژگی ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                ],
            },
        ],
    },
    {
        key: 'blog',
        path: '',
        title: 'وبلاگ',
        translateKey: '',
        icon: null,
        type: 'title',
        authority: [],
        subMenu: [
            {
                key: 'blog-management',
                path: '',
                title: 'وبلاگ',
                translateKey: '',
                icon: CategoryIcon,
                type: 'collapse',
                authority: [],
                subMenu: [
                    {
                        key: 'blog-articles',
                        path: '/blog/articles',
                        title: 'مقاله ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'blog-categories',
                        path: '/blog/categories',
                        title: 'دسته بندی ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'blog-tags',
                        path: '/blog/tags',
                        title: 'برچسب ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                ],
            },
        ],
    },
    {
        key: 'site-content',
        path: '',
        title: 'محتوای سایت',
        translateKey: '',
        icon: null,
        type: 'title',
        authority: [],
        subMenu: [
            {
                key: 'site-about',
                path: '/site/about',
                title: 'درباره ما',
                translateKey: '',
                icon: HomeIcon,
                type: 'item',
                authority: [],
                subMenu: [],
            },
            {
                key: 'site-contacts',
                path: '/site/contacts',
                title: 'راه های ارتباطی',
                translateKey: '',
                icon: SettingIcon,
                type: 'item',
                authority: [],
                subMenu: [],
            },
            {
                key: 'site-messages',
                path: '/site/messages',
                title: 'پیام های تماس',
                translateKey: '',
                icon: PeopleIcon,
                type: 'item',
                authority: [],
                subMenu: [],
            },
        ],
    },
    {
        key: 'settings',
        path: '',
        title: 'تنظیمات',
        translateKey: '',
        icon: null,
        type: 'title',
        authority: [],
        subMenu: [
            {
                key: 'language-settings',
                path: '',
                title: 'زبان و ترجمه',
                translateKey: '',
                icon: SettingIcon,
                type: 'collapse',
                authority: [],
                subMenu: [
                    {
                        key: 'languages',
                        path: '/languages',
                        title: 'زبان ها',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'interface-phrases',
                        path: '/interface-phrases',
                        title: 'عبارت های ثابت',
                        translateKey: '',
                        icon: null,
                        type: 'item',
                        authority: [],
                        subMenu: [],
                    },
                ],
            },
            {
                key: 'admins',
                path: '/admins',
                title: 'ادمین ها',
                translateKey: '',
                icon: PeopleIcon,
                type: 'item',
                authority: ['OWNER'],
                subMenu: [],
            },
        ],
    },
]

export const getNavigationRouteKey = (
    pathname: string,
    search = '',
    tree: NavigationTree[] = navigationConfig,
): string => {
    for (const item of tree) {
        if (item.path) {
            const [itemPathname, itemSearch = ''] = item.path.split('?')
            const expectedParams = new URLSearchParams(itemSearch)
            const currentParams = new URLSearchParams(search)
            const matchesSearch = [...expectedParams.entries()].every(
                ([key, value]) => currentParams.get(key) === value,
            )
            if (itemPathname === pathname && matchesSearch) return item.key
        }
        const nestedKey = getNavigationRouteKey(pathname, search, item.subMenu)
        if (nestedKey) return nestedKey
    }
    return ''
}

export const getAuthorizedNavigation = (
    permissions: readonly string[],
    tree: NavigationTree[] = navigationConfig,
    accountType?: 'CUSTOMER' | 'STAFF',
): NavigationTree[] =>
    tree.flatMap((item) => {
        if (
            item.accountTypes &&
            (!accountType || !item.accountTypes.includes(accountType))
        )
            return []
        const isAuthorized =
            item.authority.length === 0 ||
            item.authority.some((permission) =>
                permissions.includes(permission),
            )
        if (!isAuthorized) return []
        const subMenu = getAuthorizedNavigation(
            permissions,
            item.subMenu,
            accountType,
        )
        if (
            (item.type === 'title' || item.type === 'collapse') &&
            subMenu.length === 0
        )
            return []
        return [{ ...item, subMenu }]
    })

export default navigationConfig
