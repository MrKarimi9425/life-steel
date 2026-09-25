import classNames from '@/utils/classNames'
import { useThemeStore } from '@/store/themeStore'
import useResponsive from '@/utils/hooks/useResponsive'
import type { CommonProps } from '@/@types/common'
import {
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_WIDTH,
} from '@/constants/theme.constant'

export type BottomStickyBarProps = CommonProps

const BottomStickyBar = ({ children }: BottomStickyBarProps) => {
    const sideNavCollapse = useThemeStore(
        (state) => state.layout.sideNavCollapse,
    )
    const { larger } = useResponsive()
    const sideNavOffset = sideNavCollapse
        ? SIDE_NAV_COLLAPSED_WIDTH
        : SIDE_NAV_WIDTH

    return (
        <div className="mt-8 h-20 shrink-0">
            <div
                className={classNames(
                    'fixed inset-e-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
                )}
                style={{
                    insetInlineStart: larger.lg ? sideNavOffset : 0,
                }}
            >
                {children}
            </div>
        </div>
    )
}

export default BottomStickyBar
