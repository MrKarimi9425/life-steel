import { useState, Suspense, lazy } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import NavToggle from '@/components/shared/NavToggle'
import { DIR_RTL } from '@/constants/theme.constant'
import withHeaderItem, {
    type WithHeaderItemProps,
} from '@/utils/hoc/withHeaderItem'
import {
    getAuthorizedNavigation,
    getNavigationRouteKey,
} from '@/configs/navigation.config'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/features/auth'
import { useLocation } from 'react-router'

const VerticalMenuContent = lazy(() => import('./VerticalMenuContent'))

type MobileNavToggleProps = {
    toggled?: boolean
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false)
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )
    const principal = useAuthStore((state) => state.principal)
    const userAuthority = principal?.permissions ?? []
    const { pathname, search } = useLocation()

    return (
        <>
            <div className="text-2xl" onClick={() => setIsOpen(true)}>
                <MobileNavToggle toggled={isOpen} />
            </div>
            <Drawer
                title="منوی پنل"
                isOpen={isOpen}
                bodyClass={classNames('p-0')}
                width={330}
                placement={direction === DIR_RTL ? 'right' : 'left'}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
            >
                <Suspense fallback={null}>
                    {isOpen && (
                        <VerticalMenuContent
                            collapsed={sideNavCollapse}
                            navigationTree={getAuthorizedNavigation(
                                userAuthority,
                                undefined,
                                principal?.accountType,
                            )}
                            routeKey={getNavigationRouteKey(pathname, search)}
                            userAuthority={[...userAuthority]}
                            direction={direction}
                            onMenuItemClick={() => setIsOpen(false)}
                        />
                    )}
                </Suspense>
            </Drawer>
        </>
    )
}

export default MobileNav
