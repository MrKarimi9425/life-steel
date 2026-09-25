import axios from 'axios'
import { AppError } from '@/lib/errors/AppError'
import { normalizeAxiosError } from '@/lib/errors/normalize-axios-error'

export function normalizeError(error: unknown): AppError {
    if (error instanceof AppError) return error

    if (axios.isAxiosError(error)) {
        return normalizeAxiosError(error)
    }

    if (error instanceof Error) {
        return new AppError(error.message || 'خطای پیش بینی نشده ای رخ داد.', {
            kind: 'unknown',
            cause: error,
        })
    }

    if (typeof error === 'string' && error.trim()) {
        return new AppError(error, { kind: 'unknown' })
    }

    return new AppError('خطای پیش بینی نشده ای رخ داد.', {
        kind: 'unknown',
        details: error,
    })
}
