import { apiClient } from '@/lib/http/api-client'
import {
    clearAccessToken,
    setAccessToken,
} from '@/lib/http/access-token-storage'
import type { ApiResponse } from '@/lib/http/api.types'
import type {
    AuthPrincipal,
    AccessTokenResponseData,
    ChangePasswordPayload,
    PasswordSignInPayload,
} from '../types/auth.types'

export const authQueryKeys = {
    currentPrincipal: ['auth', 'current-principal'] as const,
}

export async function getCurrentPrincipal(): Promise<AuthPrincipal> {
    const response = await apiClient.get<ApiResponse<AuthPrincipal>>('auth/me')

    if (!response.data.data) {
        throw new Error('اطلاعات حساب کاربری در پاسخ سرور وجود ندارد.')
    }

    return response.data.data
}

export async function signInWithPassword(
    payload: PasswordSignInPayload,
): Promise<ApiResponse<AccessTokenResponseData>> {
    const response = await apiClient.post<ApiResponse<AccessTokenResponseData>>(
        'auth/password/sign-in',
        payload,
    )

    persistAccessToken(response.data.data)

    return response.data
}

export async function changePassword(
    payload: ChangePasswordPayload,
): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
        'auth/password/change',
        payload,
    )
    return response.data
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post('auth/logout')
    } finally {
        clearAccessToken()
    }
}

function persistAccessToken(data: AccessTokenResponseData | null): void {
    if (!data?.accessToken) {
        throw new Error('توکن دسترسی در پاسخ سرور وجود ندارد.')
    }

    setAccessToken(data.accessToken)
}
