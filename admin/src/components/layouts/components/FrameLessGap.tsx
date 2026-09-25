import type { CommonProps } from '@/@types/common'

const FrameLessGap = ({ children, className }: CommonProps) => (
    <div className={className}>{children}</div>
)

export default FrameLessGap
