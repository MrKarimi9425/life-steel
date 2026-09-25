import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import SegmentBase, { type SegmentProps } from './Segment'
import SegmentItem from './SegmentItem'

type SegmentComponent = ForwardRefExoticComponent<
    SegmentProps & RefAttributes<HTMLDivElement>
> & { Item: typeof SegmentItem }

const Segment = SegmentBase as SegmentComponent
Segment.Item = SegmentItem

export default Segment
