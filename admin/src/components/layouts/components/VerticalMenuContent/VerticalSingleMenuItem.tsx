import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Link } from 'react-router'
import Dropdown from '@/components/ui/Dropdown'
import type { CommonProps, TraslationFn } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

const { MenuItem } = Menu

interface CollapsedItemProps extends CommonProps {
    nav: NavigationTree
    direction?: Direction
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    t: TraslationFn
    renderAsIcon?: boolean
    userAuthority: string[]
    currentKey?: string
    parentKeys?: string[]
    badgeCount?: number
}

interface DefaultItemProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    sideCollapsed?: boolean
    t: TraslationFn
    indent?: boolean
    userAuthority: string[]
    showIcon?: boolean
    showTitle?: boolean
    badgeCount?: number
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps {}

const CollapsedItem = ({
    nav,
    children,
    direction,
    renderAsIcon,
    onLinkClick,
    userAuthority,
    t,
    currentKey,
    badgeCount,
}: CollapsedItemProps) => (
    <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
        {renderAsIcon ? (
            <Tooltip
                title={t(nav.translateKey, nav.title)}
                placement={direction === 'rtl' ? 'left' : 'right'}
            >
                {children}
            </Tooltip>
        ) : (
            <Dropdown.Item active={currentKey === nav.key}>
                <Link
                    className="h-full w-full flex items-center outline-hidden"
                    to={nav.path}
                    onClick={() => onLinkClick?.(nav)}
                >
                    <span>{t(nav.translateKey, nav.title)}</span>
                    {Boolean(badgeCount) && (
                        <span className="ms-auto rounded-full bg-error px-1.5 text-xs text-white">
                            {badgeCount && badgeCount > 99
                                ? '۹۹+'
                                : badgeCount?.toLocaleString('fa-IR')}
                        </span>
                    )}
                </Link>
            </Dropdown.Item>
        )}
    </AuthorityCheck>
)

const DefaultItem = ({
    nav,
    onLinkClick,
    showTitle,
    indent,
    showIcon = true,
    userAuthority,
    t,
    badgeCount,
}: DefaultItemProps) => (
    <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
        <MenuItem key={nav.key} eventKey={nav.key} dotIndent={indent}>
            <Link
                to={nav.path}
                className="flex items-center gap-2 h-full w-full"
                onClick={() => onLinkClick?.(nav)}
            >
                {showIcon && <VerticalMenuIcon icon={nav.icon} />}
                {showTitle && <span>{t(nav.translateKey, nav.title)}</span>}
                {Boolean(badgeCount) && (
                    <span className="ms-auto rounded-full bg-error px-1.5 text-xs text-white">
                        {badgeCount && badgeCount > 99
                            ? '۹۹+'
                            : badgeCount?.toLocaleString('fa-IR')}
                    </span>
                )}
            </Link>
        </MenuItem>
    </AuthorityCheck>
)

const VerticalSingleMenuItem = ({
    nav,
    onLinkClick,
    sideCollapsed,
    direction,
    indent,
    renderAsIcon,
    userAuthority,
    showIcon,
    showTitle,
    t,
    currentKey,
    parentKeys,
    badgeCount,
}: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>) => (
    <>
        {sideCollapsed ? (
            <CollapsedItem
                currentKey={currentKey}
                badgeCount={badgeCount}
                parentKeys={parentKeys}
                nav={nav}
                direction={direction}
                renderAsIcon={renderAsIcon}
                userAuthority={userAuthority}
                t={t}
                onLinkClick={onLinkClick}
            >
                <DefaultItem
                    nav={nav}
                    sideCollapsed={sideCollapsed}
                    userAuthority={userAuthority}
                    showIcon={showIcon}
                    showTitle={showTitle}
                    t={t}
                    onLinkClick={onLinkClick}
                    badgeCount={badgeCount}
                />
            </CollapsedItem>
        ) : (
            <DefaultItem
                nav={nav}
                sideCollapsed={sideCollapsed}
                userAuthority={userAuthority}
                showIcon={showIcon}
                showTitle={showTitle}
                indent={indent}
                t={t}
                onLinkClick={onLinkClick}
                badgeCount={badgeCount}
            />
        )}
    </>
)

export default VerticalSingleMenuItem
