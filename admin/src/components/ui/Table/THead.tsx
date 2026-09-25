import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

const THead = forwardRef<
    HTMLTableSectionElement,
    ComponentPropsWithRef<'thead'>
>((props, ref) => <thead {...props} ref={ref} />)

THead.displayName = 'THead'

export default THead
