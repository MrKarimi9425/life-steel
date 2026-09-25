import classNames from 'classnames'
import type { ComponentType, FC } from 'react'

export type WithHeaderItemProps = {
    className?: string
    hoverable?: boolean
}

const withDashboardHeaderItem = <T extends WithHeaderItemProps>(
    Component: ComponentType<Omit<T, keyof WithHeaderItemProps>>,
): FC<T> => {
    const WithHeaderItem: FC<T> = (props: T) => {
        const { className, hoverable = true } = props
        return (
            <Component
                {...(props as Omit<T, keyof WithHeaderItemProps>)}
                className={classNames(
                    'inline-flex size-10 cursor-pointer items-center justify-center rounded-full p-0',
                    hoverable &&
                        'transition-colors duration-300 ease-in-out hover:bg-black/5 hover:text-gray-900 dark:hover:bg-black/40 dark:hover:text-gray-100',
                    className,
                )}
            />
        )
    }
    WithHeaderItem.displayName = `withDashboardHeaderItem(${
        Component.displayName || Component.name || 'Component'
    })`
    return WithHeaderItem
}

export default withDashboardHeaderItem
