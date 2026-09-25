const ACCESS_TOKEN_STORAGE_KEY = 'life_steel_access_token'

export function getAccessToken(): string | null {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() || null
}

export function setAccessToken(accessToken: string): void {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function clearAccessToken(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}
