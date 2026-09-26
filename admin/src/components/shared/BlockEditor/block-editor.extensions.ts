import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Fragment, Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model'

/** Pasted images bypass the article gallery, so keep only the remaining content. */
export function stripPastedImages(slice: Slice): Slice {
    const strip = (fragment: Fragment): Fragment => {
        const children: ProseMirrorNode[] = []
        fragment.forEach((node) => {
            if (node.type.name !== 'image') {
                children.push(
                    node.isLeaf ? node : node.copy(strip(node.content)),
                )
            }
        })
        return Fragment.fromArray(children)
    }
    return Slice.maxOpen(strip(slice.content))
}

const GalleryImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            mediaId: {
                default: null,
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute('data-media-id'),
                renderHTML: (attributes: Record<string, unknown>) =>
                    attributes.mediaId
                        ? { 'data-media-id': attributes.mediaId }
                        : {},
            },
        }
    },
})

export function createBlockEditorExtensions() {
    return [
        StarterKit.configure({
            codeBlock: false,
            heading: { levels: [2, 3, 4] },
            link: { openOnClick: false },
            bulletList: { keepMarks: true },
            orderedList: { keepMarks: true },
        }),
        GalleryImage.configure({ allowBase64: false, inline: false }),
        TableKit.configure({ table: { resizable: false } }),
    ]
}

export const emptyBlockEditorContent = () => ({
    type: 'doc',
    content: [{ type: 'paragraph' }],
})
