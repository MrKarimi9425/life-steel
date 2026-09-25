import SideNav from '../../components/SideNav'
import Header from '../../components/Header'
import SideNavToggle from '../../components/SideNavToggle'
import MobileNav from '../../components/MobileNav'
import Search from '../../components/Search'
import LanguageSelector from '../../components/LanguageSelector'
import Notification from '../../components/Notification'
import UserProfileDropdown from '../../components/UserProfileDropdown'
import SidePanel from '../../components/SidePanel'
import LayoutBase from '../../components/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import type { CommonProps } from '@/@types/common'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'

const CollapsibleSide = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive()

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex h-screen flex-auto flex-col overflow-hidden"
        >
            <div className="flex h-full min-w-0 flex-auto overflow-hidden">
                {larger.lg && <SideNav />}
                <div className="relative flex h-full min-h-0 min-w-0 w-full flex-auto flex-col overflow-hidden">
                    <Header
                        className="shrink-0 shadow dark:shadow-2xl"
                        headerStart={
                            <>
                                {smaller.lg && <MobileNav />}
                                {larger.lg && <SideNavToggle />}
                                <Search />
                            </>
                        }
                        headerEnd={
                            <>
                                <LanguageSelector />
                                <Notification />
                                <SidePanel />
                                <UserProfileDropdown hoverable={false} />
                            </>
                        }
                    />
                    <div
                        id="dashboard-content-scroll"
                        className="minimal-scrollbar flex min-h-0 flex-auto flex-col overflow-y-auto"
                    >
                        {children}
                    </div>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide
