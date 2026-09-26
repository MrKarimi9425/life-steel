import { useCallback, useEffect, useRef, useState } from 'react'
import type { BlockEditorImage } from '@/components/shared/BlockEditor'

export function useArticleImageSelection() {
    const [isOpen, setIsOpen] = useState(false)
    const pending = useRef<((image: BlockEditorImage | null) => void) | null>(
        null,
    )
    const select = useCallback(
        () =>
            new Promise<BlockEditorImage | null>((resolve) => {
                pending.current?.(null)
                pending.current = resolve
                setIsOpen(true)
            }),
        [],
    )
    const finish = useCallback((image: BlockEditorImage | null) => {
        pending.current?.(image)
        pending.current = null
        setIsOpen(false)
    }, [])
    useEffect(() => () => pending.current?.(null), [])
    return { isOpen, select, finish }
}
