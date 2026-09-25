function toPositiveNumber(value: string | undefined, fallback: number) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback
}

export type AppConfig = {
    apiBaseUrl: string
    requestTimeoutMs: number
}

const appConfig: AppConfig = Object.freeze({
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1',
    requestTimeoutMs: toPositiveNumber(
        import.meta.env.VITE_REQUEST_TIMEOUT_MS,
        30_000,
    ),
})

export default appConfig
