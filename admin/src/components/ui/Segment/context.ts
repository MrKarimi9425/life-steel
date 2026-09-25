import { createContext, useContext } from 'react'
import type { TypeAttributes } from '../@types/common'

export type SegmentValue = string[] | string

type SegmentContextProps = {
    value?: SegmentValue
    onActive?: (itemValue: SegmentValue) => void
    onDeactivate?: (itemValue: SegmentValue) => void
    selectionType?: 'single' | 'multiple'
    size?: TypeAttributes.Size | TypeAttributes.ControlSize
}

const SegmentContext = createContext<SegmentContextProps>({})

export const SegmentContextProvider = SegmentContext.Provider

export function useSegment() {
    return useContext(SegmentContext)
}
