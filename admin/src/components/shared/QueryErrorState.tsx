import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { normalizeError } from '@/lib/errors'

interface QueryErrorStateProps {
    error: unknown
    onRetry: () => void
    title: string
}

export function QueryErrorState({
    error,
    onRetry,
    title,
}: QueryErrorStateProps) {
    const appError = normalizeError(error)

    return (
        <Alert
            className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            showIcon
            title={title}
            type="danger"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span>
                    {appError.message || 'لطفاً بعداً دوباره تلاش کنید.'}
                </span>
                <Button type="button" onClick={onRetry}>
                    تلاش دوباره
                </Button>
            </div>
        </Alert>
    )
}
