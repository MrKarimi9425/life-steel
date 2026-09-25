import { Children, cloneElement, Fragment } from 'react'
import classNames from 'classnames'
import Avatar from './Avatar'
import type { AvatarProps } from './Avatar'
import type { CommonProps } from '../@types/common'
import type { ReactElement, ReactNode } from 'react'

export interface AvatarGroupProps extends CommonProps {
    chained?: boolean
    maxCount?: number
    omittedAvatarContent?: ReactNode
    omittedAvatarProps?: AvatarProps
}

const AvatarGroup = ({
    chained = false,
    children,
    className,
    maxCount = 4,
    omittedAvatarContent,
    omittedAvatarProps,
}: AvatarGroupProps) => {
    const childCount = Children.count(children)
    const childWithKey = Children.toArray(children).map((child, index) =>
        cloneElement(child as ReactElement, {
            key: `grouped-avatar-${index}`,
        }),
    )

    if (maxCount < childCount) {
        const childToShow = childWithKey.slice(0, maxCount)
        childToShow.push(
            <Fragment key="avatar-more">
                <Avatar {...omittedAvatarProps}>
                    {omittedAvatarContent || `+${childCount - maxCount}`}
                </Avatar>
            </Fragment>,
        )
        return (
            <div
                className={classNames(
                    'avatar-group',
                    chained && 'avatar-group-chained',
                    className,
                )}
            >
                {childToShow}
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'avatar-group',
                chained && 'avatar-group-chained',
                className,
            )}
        >
            {children}
        </div>
    )
}

export default AvatarGroup
