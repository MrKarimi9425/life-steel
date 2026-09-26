import { useEffect, useMemo } from 'react'
import { generateJSON } from '@tiptap/core'
import BlockEditor from '@/components/shared/BlockEditor'
import type { BlockEditorProps } from '@/components/shared/BlockEditor'
import { createBlockEditorExtensions } from '@/components/shared/BlockEditor/block-editor.extensions'

type Props = BlockEditorProps & { legacyDescription: string }

export default function ProductDescriptionEditor({
    legacyDescription,
    value,
    onChange,
    ...props
}: Props) {
    const converted = useMemo(() => {
        if (value) return value
        const parser = new DOMParser()
        const document = parser.parseFromString(legacyDescription, 'text/html')
        // Preserve plain text line breaks and normalize unsupported old heading levels.
        if (!/<\/?[a-z][\s\S]*>/i.test(legacyDescription)) {
            document.body.replaceChildren(
                ...legacyDescription.split(/\r?\n/).map((line) => {
                    const p = document.createElement('p')
                    p.textContent = line
                    return p
                }),
            )
        }
        document.querySelectorAll('h1,h5,h6').forEach((heading) => {
            const replacement = document.createElement('h2')
            replacement.replaceChildren(...Array.from(heading.childNodes))
            heading.replaceWith(replacement)
        })
        document
            .querySelectorAll('script,style,iframe')
            .forEach((node) => node.remove())
        return generateJSON(
            document.body.innerHTML,
            createBlockEditorExtensions(),
        )
    }, [legacyDescription, value])
    useEffect(() => {
        if (!value) onChange(converted)
    }, [converted, onChange, value])
    return <BlockEditor {...props} value={converted} onChange={onChange} />
}
