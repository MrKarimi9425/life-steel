import type { FormikErrors } from 'formik'
import { toast } from 'react-toastify'
import { normalizeError } from '@/lib/errors/normalize-error'

export function reportError(error: unknown) {
    const appError = normalizeError(error)

    if (
        appError.kind !== 'cancelled' &&
        appError.kind !== 'authentication' &&
        Object.keys(appError.fieldErrors).length === 0
    ) {
        toast.error(appError.message, {
            toastId: [
                appError.kind,
                appError.statusCode,
                appError.code,
                appError.message,
            ]
                .filter(Boolean)
                .join(':'),
        })
    }

    return appError
}

export function getFormikErrors<TValues>(error: unknown) {
    return normalizeError(error).fieldErrors as FormikErrors<TValues>
}

interface FormSubmissionErrors<TValues> {
    fieldErrors: FormikErrors<TValues>
    formError?: string
}

export function getFormSubmissionErrors<TValues>(
    error: unknown,
): FormSubmissionErrors<TValues> | undefined {
    const appError = normalizeError(error)
    const fieldErrors = appError.fieldErrors as FormikErrors<TValues>

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    return undefined
}

export function shouldRetryRequest(failureCount: number, error: unknown) {
    const appError = normalizeError(error)
    return appError.retryable && failureCount < 2
}
