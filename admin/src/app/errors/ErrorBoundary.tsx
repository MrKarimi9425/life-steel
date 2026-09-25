import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import { reportError } from '@/lib/errors'

interface ErrorBoundaryState {
    hasError: boolean
}

export class ErrorBoundary extends Component<
    PropsWithChildren,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        reportError(
            new Error(error.message, {
                cause: { error, componentStack: errorInfo.componentStack },
            }),
        )
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-screen items-center p-6">
                    <Container className="max-w-xl">
                        <AdaptiveCard>
                            <h2 className="mb-2">نمایش صفحه با خطا مواجه شد</h2>
                            <p className="mb-4">
                                صفحه را دوباره بارگذاری کنید.
                            </p>
                            <Button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                بارگذاری مجدد
                            </Button>
                        </AdaptiveCard>
                    </Container>
                </main>
            )
        }

        return this.props.children
    }
}
