import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { Mode } from '@/@types/theme'

interface LogoProps extends CommonProps {
    imgClass?: string
    mode?: Mode
    type?: 'full' | 'streamline'
}

const Logo = ({ className, imgClass }: LogoProps) => (
    <div className={classNames('logo', className)}>
        <img
            alt="لایف استیل"
            className={imgClass}
            src="/img/logo/life-steel.png"
        />
    </div>
)

export default Logo
