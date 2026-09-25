import TableBase from './Table'
import Sorter from './Sorter'
import TBody from './TBody'
import Td from './Td'
import Th from './Th'
import THead from './THead'
import Tr from './Tr'

const Table = Object.assign(TableBase, {
    Sorter,
    TBody,
    Td,
    Th,
    THead,
    Tr,
})

export type { TableProps } from './Table'
export { Table }
export default Table
