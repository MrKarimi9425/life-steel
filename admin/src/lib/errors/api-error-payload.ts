import type { AxiosError } from 'axios'
import type { ApiErrorPayload, ApiFieldErrors } from '@/lib/http/api.types'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function getPayload(error: AxiosError) {
    return isRecord(error.response?.data)
        ? (error.response.data as ApiErrorPayload)
        : undefined
}

export function getPayloadMessage(payload: ApiErrorPayload | undefined) {
    if (
        typeof payload?.error?.message === 'string' &&
        payload.error.message.trim()
    ) {
        return payload.error.message
    }

    return undefined
}

function normalizeFieldErrors(errors: unknown): Record<string, string> {
    if (!isRecord(errors)) return {}

    return Object.entries(errors).reduce<Record<string, string>>(
        (result, [field, value]) => {
            if (typeof value === 'string' && value.trim()) {
                result[field] = value
            } else if (Array.isArray(value) && typeof value[0] === 'string') {
                result[field] = value[0]
            }
            return result
        },
        {},
    )
}

export function getFieldErrors(payload: ApiErrorPayload | undefined) {
    return normalizeFieldErrors(payload?.error?.fields as ApiFieldErrors)
}
