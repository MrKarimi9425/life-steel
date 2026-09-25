import type { PropsWithChildren, ReactNode } from 'react'
import Container from '@/components/shared/Container'

interface AuthPageShellProps extends PropsWithChildren {
    description: ReactNode
    title: string
}

export function AuthPageShell({
    children,
    description,
    title,
}: AuthPageShellProps) {
    return (
        <main className="h-screen bg-white dark:bg-gray-800" dir="rtl">
            <Container className="flex h-full min-w-0 flex-auto flex-col items-center justify-center">
                <section className="min-w-[320px] max-w-[400px] md:min-w-[400px]">
                    <div className="mb-8">
                        <img
                            alt="لوگوی پنل لایف استیل"
                            src="/img/logo/life-steel-full.jpg"
                            width={100}
                        />
                    </div>
                    <header className="mb-10">
                        <h2 className="mb-2">{title}</h2>
                        <p className="heading-text font-semibold">
                            {description}
                        </p>
                    </header>
                    {children}
                </section>
            </Container>
        </main>
    )
}
