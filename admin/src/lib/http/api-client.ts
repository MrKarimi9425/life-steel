import axios, { type InternalAxiosRequestConfig } from 'axios'
import appConfig from '@/configs/app.config'
import { normalizeError } from '@/lib/errors'
import { getAccessToken, setAccessToken } from './access-token-storage'
import { notifyAuthenticationFailure } from './authentication-failure'

export const apiClient = axios.create({
    baseURL: appConfig.apiBaseUrl,
    timeout: appConfig.requestTimeoutMs,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    authenticationRetry?: boolean
}

type AccessTokenResponse = {
    data: { accessToken: string } | null
}

let refreshRequest: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
    refreshRequest ??= axios
        .post<AccessTokenResponse>(
            `${appConfig.apiBaseUrl}/auth/refresh`,
            null,
            {
                timeout: appConfig.requestTimeoutMs,
                withCredentials: true,
            },
        )
        .then((response) => {
            const accessToken = response.data.data?.accessToken

            if (!accessToken) {
                throw new Error('Refresh response does not contain a token')
            }

            setAccessToken(accessToken)
            return accessToken
        })
        .finally(() => {
            refreshRequest = null
        })

    return refreshRequest
}

apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken()

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    } else {
        delete config.headers.Authorization
    }

    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            const requestConfig = error.config as
                | RetriableRequestConfig
                | undefined
            const requestUrl = requestConfig?.url ?? ''
            const isRefreshable =
                requestConfig !== undefined &&
                !requestConfig.authenticationRetry &&
                !requestUrl.includes('auth/refresh') &&
                !requestUrl.includes('auth/password/sign-in')

            if (isRefreshable) {
                requestConfig.authenticationRetry = true

                try {
                    const accessToken = await refreshAccessToken()
                    requestConfig.headers.Authorization = `Bearer ${accessToken}`
                    return apiClient.request(requestConfig)
                } catch {
                    // The normalized authentication error below owns sign-out.
                }
            }
        }

        const appError = normalizeError(error)

        if (appError.kind === 'authentication') {
            notifyAuthenticationFailure()
        }

        return Promise.reject(appError)
    },
)
