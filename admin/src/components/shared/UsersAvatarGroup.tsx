import { useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import Avatar from '@/components/ui/Avatar'
import useRandomBgColor from '@/hooks/useRandomBgColor'
import type { AvatarGroupProps, AvatarProps } from '@/components/ui/Avatar'

type User = object

interface UsersAvatarGroupProps extends AvatarGroupProps {
    avatarGroupProps?: AvatarGroupProps
    avatarProps?: AvatarProps
    imgKey?: string
    nameKey?: string
    onAvatarClick?: (avatar: User) => void
    users?: User[]
}

const UsersAvatarGroup = ({
    avatarGroupProps = {},
    avatarProps = {},
    imgKey = 'img',
    nameKey = 'name',
    onAvatarClick,
    users = [],
    ...rest
}: UsersAvatarGroupProps) => {
    const bgColor = useRandomBgColor()
    const defaultAvatarProps = useMemo(
        () => ({
            shape: 'circle' as const,
            size: 30,
            className: 'cursor-pointer',
            ...avatarProps,
        }),
        [avatarProps],
    )

    return (
        <Avatar.Group chained {...avatarGroupProps} {...rest}>
            {users.map((item, index) => {
                const user = item as Record<string, unknown>
                const name = String(user[nameKey] ?? '')
                const image = user[imgKey] ? String(user[imgKey]) : undefined
                const hasName = Boolean(name.trim())
                const fallbackLetter = Array.from(name.trim())[0] ?? ''
                const avatar = (
                    <Avatar
                        {...defaultAvatarProps}
                        className={`${image ? '' : hasName ? bgColor(name) : 'bg-gray-200 dark:bg-gray-600'} ${defaultAvatarProps.className}`}
                        src={image}
                        onClick={() => onAvatarClick?.(item)}
                    >
                        {hasName ? fallbackLetter : null}
                    </Avatar>
                )

                return hasName ? (
                    <Tooltip
                        key={`${name}-${index}`}
                        title={name}
                        wrapperClass="flex"
                    >
                        {avatar}
                    </Tooltip>
                ) : (
                    <span key={`unnamed-${index}`} className="flex">
                        {avatar}
                    </span>
                )
            })}
        </Avatar.Group>
    )
}

export default UsersAvatarGroup
