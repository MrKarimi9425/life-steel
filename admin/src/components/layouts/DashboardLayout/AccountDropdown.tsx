import UserIcon from '@/assets/icons/iconsax/linear/user.svg?react'
import LockIcon from '@/assets/icons/iconsax/linear/lock.svg?react'
import Logout01Icon from '@/assets/icons/iconsax/linear/logout-01.svg?react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withDashboardHeaderItem from './withDashboardHeaderItem'
import { authQueryKeys, logout, useAuthStore } from '@/features/auth'
import { toLocalPhoneNumber } from '@/features/auth/utils/phone-number'
import { SettingsSecurity } from '@/features/account-settings'
import FormDialog from '@/components/shared/FormDialog'
import { queryClient } from '@/lib/query/query-client'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import type { CommonProps } from '@/@types/common'

const UserDropdownContent = ({ className }: CommonProps) => {
    const navigate = useNavigate()
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const hasPassword = useAuthStore(
        (state) => state.principal?.hasPassword ?? false,
    )
    const phoneNumber = useAuthStore(
        (state) => state.principal?.phoneNumber ?? '',
    )
    const setAnonymous = useAuthStore((state) => state.setAnonymous)
    const profile = useAuthStore((state) => state.principal?.profile ?? null)

    const handleSignOut = () => {
        void logout().finally(() => {
            setAnonymous()
            queryClient.removeQueries({
                queryKey: authQueryKeys.currentPrincipal,
            })
            navigate('/sign-in', { replace: true })
        })
    }

    const fullName = [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(' ')
    const avatarProps = {
        icon: (
            <UserIcon
                aria-hidden="true"
                focusable="false"
                height={20}
                width={20}
            />
        ),
        src: profile?.avatarPath ?? undefined,
    }

    return (
        <>
            <Dropdown
                className="flex"
                hoverOpenDelay={100}
                trigger="hover"
                toggleClassName="flex items-center z-index z-50"
                renderTitle={
                    <div
                        className={`flex cursor-pointer items-center justify-center ${className ?? ''}`}
                    >
                        <Avatar size={32} {...avatarProps} />
                    </div>
                }
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="flex items-center gap-3 px-3 py-3">
                        <Avatar
                            className="shrink-0"
                            size={44}
                            {...avatarProps}
                        />
                        <div className="min-w-0 flex-1 text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {fullName || 'کاربر'}
                            </div>
                            {phoneNumber && (
                                <div
                                    className="mt-1 text-xs text-gray-500 dark:text-gray-300"
                                    dir="ltr"
                                >
                                    {toLocalPhoneNumber(phoneNumber)}
                                </div>
                            )}
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Password"
                    className="min-h-11 gap-3 px-4 py-2"
                    onClick={() => setPasswordDialogOpen(true)}
                >
                    <span className="flex size-5 shrink-0 items-center justify-center">
                        <LockIcon
                            aria-hidden="true"
                            focusable="false"
                            height={20}
                            width={20}
                        />
                    </span>
                    <span className="leading-5">
                        {hasPassword ? 'تغییر رمز عبور' : 'ایجاد رمز عبور'}
                    </span>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="min-h-11 gap-3 px-4 py-2"
                    onClick={handleSignOut}
                >
                    <span className="flex size-5 shrink-0 items-center justify-center">
                        <Logout01Icon
                            aria-hidden="true"
                            focusable="false"
                            height={20}
                            width={20}
                        />
                    </span>
                    <span className="leading-5">خروج</span>
                </Dropdown.Item>
            </Dropdown>
            <FormDialog
                isOpen={passwordDialogOpen}
                title={hasPassword ? 'تغییر رمز عبور' : 'ایجاد رمز عبور'}
                width={520}
                onClose={() => setPasswordDialogOpen(false)}
            >
                <SettingsSecurity
                    onSuccess={() => setPasswordDialogOpen(false)}
                />
            </FormDialog>
        </>
    )
}

const AccountDropdown = withDashboardHeaderItem(UserDropdownContent)

export default AccountDropdown
