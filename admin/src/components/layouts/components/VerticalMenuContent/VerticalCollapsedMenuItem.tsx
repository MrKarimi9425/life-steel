import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import VerticalMenuIcon from './VerticalMenuIcon'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import type { CommonProps, TraslationFn } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    t: TraslationFn
    indent?: boolean
    dotIndent?: boolean
    userAuthority: string[]
    badgeCount?: number
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
    renderAsIcon?: boolean
    currentKey?: string
    parentKeys?: string[]
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({
    nav,
    indent,
    dotIndent,
    children,
    userAuthority,
    t,
    badgeCount,
}: DefaultItemProps) => (
    <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
        <MenuCollapse
            key={nav.key}
            label={
                <>
                    <VerticalMenuIcon icon={nav.icon} />
                    <span>{t(nav.translateKey, nav.title)}</span>
                    {Boolean(badgeCount) && (
                        <span className="ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-semibold leading-5 text-white">
                            {badgeCount && badgeCount > 99
                                ? '۹۹+'
                                : badgeCount?.toLocaleString('fa-IR')}
                        </span>
                    )}
                </>
            }
            eventKey={nav.key}
            expanded={false}
            dotIndent={dotIndent}
            indent={indent}
        >
            {children}
        </MenuCollapse>
    </AuthorityCheck>
)

const CollapsedItem = ({
    nav,
    direction,
    children,
    t,
    renderAsIcon,
    userAuthority,
    parentKeys,
    badgeCount,
}: CollapsedItemProps) => {
    const menuItem = (
        <MenuItem
            key={nav.key}
            isActive={parentKeys?.includes(nav.key)}
            eventKey={nav.key}
            className="relative mb-2 justify-center px-0"
        >
            <VerticalMenuIcon icon={nav.icon} />
            {Boolean(badgeCount) && (
                <span className="absolute end-1 top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold leading-4 text-white">
                    {badgeCount && badgeCount > 99
                        ? '۹۹+'
                        : badgeCount?.toLocaleString('fa-IR')}
                </span>
            )}
        </MenuItem>
    )

    const dropdownItem = (
        <div key={nav.key}>{t(nav.translateKey, nav.title)}</div>
    )

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <Dropdown
                trigger="hover"
                hoverOpenDelay={0}
                renderTitle={renderAsIcon ? menuItem : dropdownItem}
                placement={direction === 'rtl' ? 'left-start' : 'right-start'}
            >
                {children}
            </Dropdown>
        </AuthorityCheck>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) =>
    sideCollapsed ? <CollapsedItem {...rest} /> : <DefaultItem {...rest} />

export default VerticalCollapsedMenuItem
