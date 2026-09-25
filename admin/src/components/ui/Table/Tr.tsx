import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

const Tr = forwardRef<HTMLTableRowElement, ComponentPropsWithRef<'tr'>>(
    (props, ref) => <tr {...props} ref={ref} />,
)

Tr.displayName = 'Tr'

export default Tr
