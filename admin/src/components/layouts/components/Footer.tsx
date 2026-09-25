import type { CommonProps } from '@/@types/common'

export type FooterPageContainerType = 'default' | 'contained' | 'gutterless'

const Footer = ({ children }: CommonProps) => <footer>{children}</footer>

export default Footer
