import type { JSONContent } from '@tiptap/core'

export type BlockEditorContent = JSONContent

export type BlockEditorImage = {
    mediaId: string
    src: string
    alt: string
    title?: string
}

export type BlockEditorProps = {
    value: BlockEditorContent | null
    onChange: (value: BlockEditorContent) => void
    direction?: 'rtl' | 'ltr'
    disabled?: boolean
    invalid?: boolean
    /** The owner supplies a picker restricted to its own gallery. */
    onSelectImage?: () => Promise<BlockEditorImage | null>
    onImageError?: (error: unknown) => void
}
