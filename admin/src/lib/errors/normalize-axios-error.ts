import axios, { type AxiosError } from 'axios'
import { AppError } from '@/lib/errors/AppError'
import {
    getFieldErrors,
    getPayload,
    getPayloadMessage,
} from '@/lib/errors/api-error-payload'
import { getStatusMessage, statusToKind } from '@/lib/errors/http-status'

export function normalizeAxiosError(error: AxiosError): AppError {
    if (axios.isCancel(error)) {
        return new AppError('درخواست لغو شد.', {
            kind: 'cancelled',
            code: error.code,
            cause: error,
        })
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new AppError('مهلت پاسخ گویی سرور تمام شد.', {
            kind: 'timeout',
            code: error.code,
            retryable: true,
            cause: error,
        })
    }

    if (!error.response) {
        return new AppError('ارتباط با سرور برقرار نشد.', {
            kind: 'network',
            code: error.code,
            retryable: true,
            cause: error,
        })
    }

    const statusCode = error.response.status
    const payload = getPayload(error)

    return new AppError(
        getPayloadMessage(payload) ?? getStatusMessage(statusCode),
        {
            kind: statusToKind(statusCode),
            statusCode,
            code: payload?.error?.code ?? error.code,
            details: payload,
            fieldErrors: getFieldErrors(payload),
            retryable:
                statusCode === 408 || statusCode === 429 || statusCode >= 500,
            cause: error,
        },
    )
}
