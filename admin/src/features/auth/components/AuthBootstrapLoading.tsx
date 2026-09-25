import Loading from '@/components/shared/Loading'

export function AuthBootstrapLoading() {
    return (
        <div aria-live="polite" className="min-h-screen" role="status">
            <Loading loading className="min-h-screen" />
            <span className="sr-only">در حال بارگذاری</span>
        </div>
    )
}
