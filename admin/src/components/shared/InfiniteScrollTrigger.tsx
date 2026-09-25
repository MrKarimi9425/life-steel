import { useEffect, useRef } from 'react'
import Spinner from '@/components/ui/Spinner'

interface InfiniteScrollTriggerProps {
    hasMore: boolean
    onLoadMore: () => void
}

export default function InfiniteScrollTrigger({
    hasMore,
    onLoadMore,
}: InfiniteScrollTriggerProps) {
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const trigger = triggerRef.current
        if (!trigger || !hasMore) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) onLoadMore()
            },
            { rootMargin: '120px 0px' },
        )

        observer.observe(trigger)
        return () => observer.disconnect()
    }, [hasMore, onLoadMore])

    return (
        <div
            ref={triggerRef}
            className="flex min-h-12 items-center justify-center py-3"
        >
            {hasMore && <Spinner size={24} />}
        </div>
    )
}
