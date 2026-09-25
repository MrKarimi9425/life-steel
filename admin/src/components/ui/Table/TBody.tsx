import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

const TBody = forwardRef<
    HTMLTableSectionElement,
    ComponentPropsWithRef<'tbody'>
>((props, ref) => <tbody {...props} ref={ref} />)

TBody.displayName = 'TBody'

export default TBody
