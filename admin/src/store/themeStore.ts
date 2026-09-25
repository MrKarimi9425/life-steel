import { create } from 'zustand'
import { DIR_RTL, LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { Direction, LayoutType, Mode } from '@/@types/theme'

interface ThemeState {
    direction: Direction
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
    }
    mode: Mode
    panelExpand: boolean
    setPanelExpand: (panelExpand: boolean) => void
    setSideNavCollapse: (sideNavCollapse: boolean) => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
    direction: DIR_RTL,
    layout: {
        type: LAYOUT_COLLAPSIBLE_SIDE,
        sideNavCollapse: false,
    },
    mode: 'light',
    panelExpand: false,
    setPanelExpand: (panelExpand) => set({ panelExpand }),
    setSideNavCollapse: (sideNavCollapse) =>
        set((state) => ({
            layout: { ...state.layout, sideNavCollapse },
        })),
}))
