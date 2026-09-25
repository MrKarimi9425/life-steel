import {
    createContext,
    useContext,
    type ComponentType,
    type ReactNode,
} from 'react'

interface ReassembledComponentProps extends Record<string, unknown> {
    children?: ReactNode
}

interface PageContainerReassembleProps {
    children?: ReactNode
    defaultClass?: string
    footer?: ReactNode
    header?: {
        description?: ReactNode
        title?: ReactNode
    }
    pageBackgroundType?: 'default' | 'plain'
    pageContainerDefaultClass?: string
    pageContainerGutterClass?: string
    pageContainerType?: 'default' | 'contained' | 'gutterless'
    PageContainerBody: ComponentType<ReassembledComponentProps>
    PageContainerFooter: ComponentType<ReassembledComponentProps>
    PageContainerHeader: ComponentType<ReassembledComponentProps>
}

export interface LayoutContextProps {
    adaptiveCardActive?: boolean
    isDesktopSidebarCollapsed?: boolean
    pageContainerReassemble?: (props: PageContainerReassembleProps) => ReactNode
    type?: string
}

export const LayoutContext = createContext<LayoutContextProps>({})

export const useLayout = () => useContext(LayoutContext)
