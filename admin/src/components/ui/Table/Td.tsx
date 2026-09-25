import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'

const Td = forwardRef<HTMLTableCellElement, ComponentPropsWithRef<'td'>>(
    (props, ref) => <td {...props} ref={ref} />,
)

Td.displayName = 'Td'

export default Td
