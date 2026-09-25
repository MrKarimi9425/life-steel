import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useThemeStore } from '@/store/themeStore'
import useResponsive from '@/utils/hooks/useResponsive'
import NavToggle from '@/components/shared/NavToggle'
import type { CommonProps } from '@/@types/common'

const InnerSideNavToggle = ({ className }: CommonProps) => {
    const { layout, setSideNavCollapse } = useThemeStore((state) => state)
    const sideNavCollapse = layout.sideNavCollapse
    const { larger } = useResponsive()

    return (
        <>
            {larger.md && (
                <div
                    className={`${className ?? ''} shrink-0`}
                    role="button"
                    aria-label={sideNavCollapse ? 'باز کردن منو' : 'بستن منو'}
                    onClick={() => setSideNavCollapse(!sideNavCollapse)}
                >
                    <NavToggle toggled={sideNavCollapse} />
                </div>
            )}
        </>
    )
}

const SideNavToggle = withHeaderItem(InnerSideNavToggle)

export default SideNavToggle
