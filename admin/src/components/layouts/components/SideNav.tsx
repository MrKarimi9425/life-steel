import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import Logo from './Logo'
import VerticalMenuContent from './VerticalMenuContent'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/features/auth'
import {
    getAuthorizedNavigation,
    getNavigationRouteKey,
} from '@/configs/navigation.config'
import { Link, useLocation } from 'react-router'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    mode?: Mode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    background = true,
    className,
    contentClass,
    mode,
}: SideNavProps) => {
    const defaultMode = useThemeStore((state) => state.mode)
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )
    const principal = useAuthStore((state) => state.principal)
    const userAuthority = principal?.permissions ?? []
    const { pathname, search } = useLocation()
    const currentRouteKey = getNavigationRouteKey(pathname, search)
    const authorizedNavigation = getAuthorizedNavigation(
        userAuthority,
        undefined,
        principal?.accountType,
    )

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <Link
                to="/"
                className="side-nav-header relative z-10 flex flex-col justify-center shadow dark:shadow-2xl"
                style={{ height: HEADER_HEIGHT }}
            >
                <Logo
                    imgClass="max-h-10"
                    mode={mode || defaultMode}
                    type={sideNavCollapse ? 'streamline' : 'full'}
                    className={classNames(
                        sideNavCollapse && 'ltr:ml-[11.5px] ltr:mr-[11.5px]',
                        sideNavCollapse
                            ? SIDE_NAV_CONTENT_GUTTER
                            : LOGO_X_GUTTER,
                    )}
                />
            </Link>
            <div className={classNames('side-nav-content', contentClass)}>
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={authorizedNavigation}
                        routeKey={currentRouteKey}
                        direction={direction}
                        userAuthority={[...userAuthority]}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav
