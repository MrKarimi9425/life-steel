import Spinner from '@/components/ui/Spinner'
import classNames from 'classnames'
import type { ElementType, ReactNode } from 'react'
import type { CommonProps } from '@/components/ui/@types/common'

interface LoadingProps extends CommonProps {
    asElement?: ElementType
    customLoader?: ReactNode
    loading: boolean
    spinnerClass?: string
    type?: 'default' | 'cover'
}

const Loading = ({
    type = 'default',
    loading,
    children,
    spinnerClass,
    className,
    asElement: Component = 'div',
    customLoader,
}: LoadingProps) => {
    if (type === 'cover') {
        return (
            <Component className={classNames(loading && 'relative', className)}>
                {children}
                {loading && (
                    <>
                        <div className="absolute inset-0 h-full w-full bg-white/50 dark:bg-gray-800/60" />
                        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                            {customLoader ?? (
                                <Spinner className={spinnerClass} size={40} />
                            )}
                        </div>
                    </>
                )}
            </Component>
        )
    }

    return loading ? (
        <Component
            className={classNames(
                !customLoader && 'flex h-full items-center justify-center',
                className,
            )}
        >
            {customLoader ?? <Spinner className={spinnerClass} size={40} />}
        </Component>
    ) : (
        <>{children}</>
    )
}

export default Loading
