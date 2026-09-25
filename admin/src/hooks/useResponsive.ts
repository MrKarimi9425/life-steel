import { useCallback, useEffect, useState } from 'react'

const twBreakpoint: Record<'2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs', string> = {
    '2xl': '1536',
    xl: '1280',
    lg: '1024',
    md: '768',
    sm: '640',
    xs: '576',
}

const breakpointInt = (str = '') => {
    return parseInt(str.replace('px', ''))
}

const breakpoint = {
    '2xl': breakpointInt(twBreakpoint['2xl']),
    xl: breakpointInt(twBreakpoint.xl),
    lg: breakpointInt(twBreakpoint.lg),
    md: breakpointInt(twBreakpoint.md),
    sm: breakpointInt(twBreakpoint.sm),
    xs: breakpointInt(twBreakpoint.xs),
}

export const useResponsive = () => {
    const getAllSizes = useCallback((comparator = 'smaller') => {
        const currentWindowWidth = window.innerWidth
        return Object.fromEntries(
            Object.entries(breakpoint).map(([key, value]) => [
                key,
                comparator === 'larger'
                    ? currentWindowWidth > value
                    : currentWindowWidth < value,
            ]),
        )
    }, [])

    const getResponsiveState = useCallback(() => {
        const currentWindowWidth = window.innerWidth
        return {
            windowWidth: currentWindowWidth,
            larger: getAllSizes('larger'),
            smaller: getAllSizes('smaller'),
        }
    }, [getAllSizes])

    const [responsive, setResponsive] = useState(getResponsiveState())

    const resizeHandler = useCallback(() => {
        const responsiveState = getResponsiveState()
        setResponsive(responsiveState)
    }, [getResponsiveState])

    useEffect(() => {
        window.addEventListener('resize', resizeHandler)
        return () => window.removeEventListener('resize', resizeHandler)
    }, [resizeHandler])

    return responsive
}
