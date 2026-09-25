import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import BaseAvatar, { type AvatarProps } from './Avatar'
import AvatarGroup from './AvatarGroup'

export type { AvatarProps } from './Avatar'
export type { AvatarGroupProps } from './AvatarGroup'

type AvatarComponent = ForwardRefExoticComponent<
    AvatarProps & RefAttributes<HTMLSpanElement>
> & {
    Group: typeof AvatarGroup
}

const Avatar = BaseAvatar as AvatarComponent
Avatar.Group = AvatarGroup

export { Avatar }
export default Avatar
