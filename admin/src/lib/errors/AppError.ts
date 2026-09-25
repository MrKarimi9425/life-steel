export type ErrorKind =
    | 'cancelled'
    | 'network'
    | 'timeout'
    | 'authentication'
    | 'authorization'
    | 'not-found'
    | 'validation'
    | 'client'
    | 'server'
    | 'unknown'

interface AppErrorOptions {
    kind: ErrorKind
    statusCode?: number
    code?: string
    details?: unknown
    fieldErrors?: Record<string, string>
    retryable?: boolean
    cause?: unknown
}

export class AppError extends Error {
    readonly kind: ErrorKind
    readonly statusCode?: number
    readonly code?: string
    readonly details?: unknown
    readonly fieldErrors: Record<string, string>
    readonly retryable: boolean

    constructor(message: string, options: AppErrorOptions) {
        super(message, { cause: options.cause })
        this.name = 'AppError'
        this.kind = options.kind
        this.statusCode = options.statusCode
        this.code = options.code
        this.details = options.details
        this.fieldErrors = options.fieldErrors ?? {}
        this.retryable = options.retryable ?? false
    }
}
