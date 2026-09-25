import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PanelThemeSchema } from '@/configs/panel-theme-schemas'

export type PanelTheme = 'light' | 'dark' | 'system'
export type TableDensity = 'comfortable' | 'default' | 'compact'

interface PanelPreferencesState {
    defaultPageSize: number
    notificationsEnabled: boolean
    tableDensity: TableDensity
    theme: PanelTheme
    themeSchema: PanelThemeSchema
    reset: () => void
    setDefaultPageSize: (defaultPageSize: number) => void
    setNotificationsEnabled: (notificationsEnabled: boolean) => void
    setTableDensity: (tableDensity: TableDensity) => void
    setTheme: (theme: PanelTheme) => void
    setThemeSchema: (themeSchema: PanelThemeSchema) => void
}

const defaults = {
    defaultPageSize: 10,
    notificationsEnabled: true,
    tableDensity: 'default' as TableDensity,
    theme: 'light' as PanelTheme,
    themeSchema: 'default' as PanelThemeSchema,
}

export const usePanelPreferencesStore = create<PanelPreferencesState>()(
    persist(
        (set) => ({
            ...defaults,
            reset: () => set(defaults),
            setDefaultPageSize: (defaultPageSize) => set({ defaultPageSize }),
            setNotificationsEnabled: (notificationsEnabled) =>
                set({ notificationsEnabled }),
            setTableDensity: (tableDensity) => set({ tableDensity }),
            setTheme: (theme) => set({ theme }),
            setThemeSchema: (themeSchema) => set({ themeSchema }),
        }),
        {
            name: 'life-steel-panel-preferences',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
