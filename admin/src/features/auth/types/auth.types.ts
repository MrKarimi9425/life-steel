export type UserRole = string

export interface AuthPrincipal {
    userId: string
    phoneNumber: string
    role: UserRole
    accountType: 'CUSTOMER' | 'STAFF'
    permissions: string[]
    hasPassword: boolean
    isOwner: boolean
    mustChangePassword: boolean
    profile: {
        firstName: string | null
        lastName: string | null
        avatarPath: string | null
    } | null
}

export interface AccessTokenResponseData {
    accessToken: string
}

export type AuthLifecycleStatus =
    | 'bootstrapping'
    | 'authenticated'
    | 'anonymous'

export interface PasswordSignInFormValues {
    password: string
    phoneNumber: string
}

export type PasswordSignInPayload = PasswordSignInFormValues

export interface ChangePasswordFormValues {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface ChangePasswordPayload {
    currentPassword: string
    newPassword: string
}
