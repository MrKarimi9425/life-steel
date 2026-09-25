import { forwardRef, useMemo } from 'react'
import classNames from 'classnames'
import useControllableState from '../hooks/useControllableState'
import type { CommonProps, TypeAttributes } from '../@types/common'
import { SegmentContextProvider, type SegmentValue } from './context'

export interface SegmentProps extends CommonProps {
    defaultValue?: SegmentValue
    onChange?: (segmentValue: SegmentValue) => void
    selectionType?: 'single' | 'multiple'
    size?: TypeAttributes.Size
    value?: SegmentValue
}

const Segment = forwardRef<HTMLDivElement, SegmentProps>((props, ref) => {
    const {
        children,
        className,
        defaultValue,
        onChange = () => undefined,
        selectionType = 'single',
        size,
        value: valueProp,
        ...rest
    } = props
    const [value, setValue] = useControllableState({
        prop: valueProp,
        defaultProp: defaultValue,
        onChange,
    })

    const segmentValue = useMemo(() => {
        if (selectionType === 'single') {
            if (typeof value === 'string') return value ? [value] : []
            return Array.isArray(value) ? value : []
        }
        return value ?? []
    }, [selectionType, value])

    return (
        <SegmentContextProvider
            value={{
                value: segmentValue,
                selectionType,
                size,
                onActive: setValue,
                onDeactivate: (itemValue) => {
                    if (selectionType === 'single') {
                        setValue('')
                        return
                    }
                    setValue((previousValue = []) =>
                        (previousValue as string[]).filter(
                            (currentValue) => currentValue !== itemValue,
                        ),
                    )
                },
            }}
        >
            <div
                ref={ref}
                className={classNames(
                    'segment gap-2 bg-gray-100 dark:bg-gray-700',
                    className,
                )}
                {...rest}
            >
                {children}
            </div>
        </SegmentContextProvider>
    )
})

Segment.displayName = 'Segment'

export default Segment
