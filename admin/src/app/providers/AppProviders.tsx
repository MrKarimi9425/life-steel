import { useEffect, type PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary } from '@/app/errors/ErrorBoundary'
import ConfigProvider, {
    defaultConfig,
    type Config,
} from '@/components/ui/ConfigProvider'
import { AuthSessionSynchronizer } from '@/features/auth'
import { queryClient } from '@/lib/query/query-client'
import { usePanelPreferencesStore } from '@/store/panelPreferencesStore'
import { panelThemeSchemas } from '@/configs/panel-theme-schemas'

const appConfig: Config = {
    ...defaultConfig,
    direction: 'rtl',
    locale: 'fa',
}

export function AppProviders({ children }: PropsWithChildren) {
    const notificationsEnabled = usePanelPreferencesStore(
        (state) => state.notificationsEnabled,
    )
    const theme = usePanelPreferencesStore((state) => state.theme)
    const themeSchema = usePanelPreferencesStore((state) => state.themeSchema)

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const applyTheme = () => {
            const dark =
                theme === 'dark' || (theme === 'system' && media.matches)
            const colors =
                panelThemeSchemas[themeSchema][dark ? 'dark' : 'light']
            const root = document.documentElement
            root.classList.toggle('dark', dark)
            root.style.colorScheme = dark ? 'dark' : 'light'
            root.style.setProperty('--color-primary', colors.primary)
            root.style.setProperty('--color-primary-deep', colors.primaryDeep)
            root.style.setProperty('--color-primary-mild', colors.primaryMild)
            root.style.setProperty(
                '--color-primary-subtle',
                colors.primarySubtle,
            )
            root.style.setProperty('--color-neutral', colors.neutral)
        }

        applyTheme()
        media.addEventListener('change', applyTheme)
        return () => media.removeEventListener('change', applyTheme)
    }, [theme, themeSchema])

    return (
        <ConfigProvider value={appConfig}>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <BrowserRouter>
                        <AuthSessionSynchronizer />
                        {children}
                    </BrowserRouter>
                </ErrorBoundary>
                {notificationsEnabled && (
                    <ToastContainer
                        autoClose={5_000}
                        className="[direction:rtl]"
                        closeOnClick
                        draggable
                        limit={4}
                        newestOnTop
                        pauseOnFocusLoss
                        pauseOnHover
                        position="top-center"
                        rtl
                        theme={theme === 'dark' ? 'dark' : 'light'}
                        toastClassName="!rounded-xl !font-sans !text-sm !leading-[1.5] !font-medium"
                    />
                )}
            </QueryClientProvider>
        </ConfigProvider>
    )
}
