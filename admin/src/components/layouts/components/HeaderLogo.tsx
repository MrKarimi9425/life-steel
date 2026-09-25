import { Link } from 'react-router'
import Logo from './Logo'
import type { Mode } from '@/@types/theme'

const HeaderLogo = ({ mode }: { mode?: Mode }) => (
    <Link to="/">
        <Logo imgClass="max-h-10" mode={mode} />
    </Link>
)

export default HeaderLogo
