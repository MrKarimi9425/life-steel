import type { CommonProps } from '@/@types/common'

interface AuthorityCheckProps extends CommonProps {
    userAuthority: string[]
    authority: string[]
}

const AuthorityCheck = ({
    authority = [],
    children,
    userAuthority = [],
}: AuthorityCheckProps) => {
    const allowed =
        authority.length === 0 ||
        authority.some((permission) => userAuthority.includes(permission))

    return <>{allowed ? children : null}</>
}

export default AuthorityCheck
