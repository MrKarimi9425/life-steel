import { forwardRef, type ElementType } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '@/components/ui/@types/common'

interface ContainerProps extends CommonProps {
    asElement?: ElementType
}

const Container = forwardRef<HTMLElement, ContainerProps>((props, ref) => {
    const { className, children, asElement: Component = 'div', ...rest } = props

    return (
        <Component
            ref={ref}
            className={classNames('container mx-auto', className)}
            {...rest}
        >
            {children}
        </Component>
    )
})

Container.displayName = 'Container'

export default Container
