import { useState, type ReactNode, type UIEvent } from 'react'
import classNames from '@/utils/classNames'
import AdaptiveCard from './AdaptiveCard'
import Container from './Container'
import PageHeader from './PageHeader'

interface ListPageLayoutProps {
    children: ReactNode
    title: ReactNode
    subtitle: ReactNode
    actions?: ReactNode
    filters?: ReactNode
    className?: string
    contentClassName?: string
}

export default function ListPageLayout({
    children,
    title,
    subtitle,
    actions,
    filters,
    className,
    contentClassName,
}: ListPageLayoutProps) {
    const [isScrolled, setIsScrolled] = useState(false)

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        setIsScrolled(event.currentTarget.scrollTop > 0)
    }

    return (
        <Container
            className={classNames(
                'min-h-full w-full max-w-none! sm:h-full sm:min-h-0 lg:-mx-2 lg:w-[calc(100%+1rem)]',
                className,
            )}
        >
            <AdaptiveCard
                className="min-h-full sm:h-full sm:min-h-0 sm:overflow-hidden"
                bodyClass="flex min-h-full flex-col p-0 sm:h-full sm:min-h-0 sm:overflow-hidden"
            >
                <div className="flex shrink-0 flex-col gap-4 p-4 sm:p-6">
                    <PageHeader
                        actions={actions}
                        subtitle={subtitle}
                        title={title}
                    />
                    {filters}
                </div>
                <div
                    data-scrolled={isScrolled}
                    className={classNames(
                        'list-scroll-region minimal-scrollbar flex flex-col sm:min-h-0 sm:flex-1 sm:overflow-x-auto sm:overflow-y-auto',
                        contentClassName,
                    )}
                    onScroll={handleScroll}
                >
                    {children}
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export function ListPageContent({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-full shrink-0 flex-col gap-6 p-4 sm:p-6">
            {children}
        </div>
    )
}
