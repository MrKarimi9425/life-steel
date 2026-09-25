import { useMemo } from 'react'
import type { NavigationTree } from '@/@types/navigation'

interface NavInfo extends NavigationTree {
    parentKey?: string
}

const findRoute = (
    navigationTree: NavigationTree[],
    key: string,
    parentKey?: string,
): NavInfo | undefined => {
    for (const item of navigationTree) {
        if (item.key === key) return { ...item, parentKey }

        const nested = findRoute(item.subMenu, key, item.key)
        if (nested) return nested
    }

    return undefined
}

const useMenuActive = (navigationTree: NavigationTree[], key: string) => {
    const activedRoute = useMemo(
        () => findRoute(navigationTree, key),
        [key, navigationTree],
    )

    return { activedRoute }
}

export default useMenuActive
