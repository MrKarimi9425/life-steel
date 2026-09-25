import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

const Th = forwardRef<HTMLTableCellElement, ComponentPropsWithRef<'th'>>(
    (props, ref) => <th {...props} ref={ref} />,
)

Th.displayName = 'Th'

export default Th
