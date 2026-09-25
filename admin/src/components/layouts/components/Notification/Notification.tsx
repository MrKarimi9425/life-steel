import NotificationIcon from '@/assets/icons/iconsax/linear/notification.svg?react'
import Badge from '@/components/ui/Badge'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import type { CommonProps } from '@/@types/common'
import { usePanelPreferencesStore } from '@/store/panelPreferencesStore'

const NotificationContent = ({ className }: CommonProps) => {
    const enabled = usePanelPreferencesStore(
        (state) => state.notificationsEnabled,
    )

    if (!enabled) return null

    return (
        <div className={`text-2xl ${className ?? ''}`}>
            <Badge badgeStyle={{ top: '3px', right: '6px' }}>
                <NotificationIcon aria-hidden="true" focusable="false" />
            </Badge>
        </div>
    )
}

const Notification = withHeaderItem(NotificationContent)

export default Notification
