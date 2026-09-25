import { Fragment } from 'react'
import Menu from '@/components/ui/Menu'
import VerticalSingleMenuItem from './VerticalSingleMenuItem'
import VerticalCollapsedMenuItem from './VerticalCollapsedMenuItem'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import useMenuActive from '@/utils/hooks/useMenuActive'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'
import type { TraslationFn } from '@/@types/common'

export interface VerticalMenuContentProps {
    collapsed?: boolean
    routeKey: string
    navigationTree?: NavigationTree[]
    onMenuItemClick?: () => void
    direction?: Direction
    translationSetup?: boolean
    userAuthority: string[]
}

const { MenuGroup } = Menu
const MAX_CASCADE_LEVEL = 2
const translate: TraslationFn = (_key, fallback = '') =>
    typeof fallback === 'string' ? fallback : ''

const VerticalMenuContent = ({
    collapsed,
    routeKey,
    navigationTree = [],
    onMenuItemClick,
    direction = 'rtl',
    userAuthority,
}: VerticalMenuContentProps) => {
    const { activedRoute } = useMenuActive(navigationTree, routeKey)
    const defaultExpandKey = activedRoute?.parentKey
        ? [activedRoute.parentKey]
        : []

    const renderNavigation = (
        navTree: NavigationTree[],
        cascade = 0,
        indent?: boolean,
    ) => {
        const nextCascade = cascade + 1

        return (
            <>
                {navTree.map((nav) => (
                    <Fragment key={nav.key}>
                        {nav.type === NAV_ITEM_TYPE_ITEM && (
                            <VerticalSingleMenuItem
                                currentKey={activedRoute?.key}
                                parentKeys={defaultExpandKey}
                                nav={nav}
                                sideCollapsed={collapsed}
                                direction={direction}
                                indent={indent}
                                renderAsIcon={cascade <= 0}
                                showIcon={cascade <= 0}
                                userAuthority={userAuthority}
                                showTitle={
                                    collapsed
                                        ? cascade >= 1
                                        : cascade <= MAX_CASCADE_LEVEL
                                }
                                t={translate}
                                onLinkClick={onMenuItemClick}
                            />
                        )}
                        {nav.type === NAV_ITEM_TYPE_COLLAPSE && (
                            <VerticalCollapsedMenuItem
                                currentKey={activedRoute?.key}
                                parentKeys={defaultExpandKey}
                                nav={nav}
                                sideCollapsed={collapsed}
                                direction={direction}
                                indent={nextCascade >= MAX_CASCADE_LEVEL}
                                dotIndent={nextCascade >= MAX_CASCADE_LEVEL}
                                renderAsIcon={nextCascade <= 1}
                                userAuthority={userAuthority}
                                t={translate}
                                onLinkClick={onMenuItemClick}
                            >
                                {nav.subMenu.length > 0 &&
                                    renderNavigation(
                                        nav.subMenu,
                                        nextCascade,
                                        true,
                                    )}
                            </VerticalCollapsedMenuItem>
                        )}
                        {nav.type === NAV_ITEM_TYPE_TITLE && (
                            <AuthorityCheck
                                userAuthority={userAuthority}
                                authority={nav.authority}
                            >
                                <MenuGroup key={nav.key} label={nav.title}>
                                    {nav.subMenu.length > 0 &&
                                        renderNavigation(
                                            nav.subMenu,
                                            cascade,
                                            false,
                                        )}
                                </MenuGroup>
                            </AuthorityCheck>
                        )}
                    </Fragment>
                ))}
            </>
        )
    }

    return (
        <Menu
            className="px-4 pb-4"
            sideCollapsed={collapsed}
            defaultActiveKeys={activedRoute?.key ? [activedRoute.key] : []}
            defaultExpandedKeys={defaultExpandKey}
            defaultCollapseActiveKeys={
                activedRoute?.parentKey ? [activedRoute.parentKey] : []
            }
        >
            {renderNavigation(navigationTree)}
        </Menu>
    )
}

export default VerticalMenuContent
