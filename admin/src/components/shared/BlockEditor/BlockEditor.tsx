import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import DragHandle from '@tiptap/extension-drag-handle-react'
import { LuGripVertical } from 'react-icons/lu'
import classNames from '@/utils/classNames'
import { normalizeError } from '@/lib/errors'
import { toast } from 'react-toastify'
import BlockEditorToolbar from './BlockEditorToolbar'
import {
    createBlockEditorExtensions,
    emptyBlockEditorContent,
    stripPastedImages,
} from './block-editor.extensions'
import type { BlockEditorProps } from './block-editor.types'
import { dropTopLevelBlock } from './block-editor.drop'

export default function BlockEditor({
    value,
    onChange,
    direction = 'rtl',
    disabled = false,
    invalid = false,
    onSelectImage,
    onImageError,
}: BlockEditorProps) {
    const [selectingImage, setSelectingImage] = useState(false)
    const selectingImageRef = useRef(false)
    const callbacks = useRef({ onChange, onImageError })
    callbacks.current = { onChange, onImageError }
    const mounted = useRef(true)
    const contentRevision = useRef(0)
    const editor = useEditor({
        extensions: createBlockEditorExtensions(),
        content: value ?? emptyBlockEditorContent(),
        immediatelyRender: false,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: 'min-h-64 outline-none',
                dir: direction,
                'aria-label': 'محتوای مقاله',
            },
            // Images must be selected from the owner's gallery, never pasted as URLs.
            transformPasted: (slice, view) =>
                view.dragging ? slice : stripPastedImages(slice),
            handleDrop: dropTopLevelBlock,
        },
        onUpdate: ({ editor: current }) =>
            callbacks.current.onChange(current.getJSON()),
    })
    const editorState = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            focused: current?.isFocused ?? false,
        }),
    })
    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])
    useEffect(() => {
        if (
            !editor ||
            JSON.stringify(editor.getJSON()) ===
                JSON.stringify(value ?? emptyBlockEditorContent())
        )
            return
        contentRevision.current++
        editor.commands.setContent(value ?? emptyBlockEditorContent(), {
            emitUpdate: false,
        })
    }, [editor, value])
    useEffect(() => {
        contentRevision.current++
        editor?.setEditable(!disabled)
        editor?.setOptions({
            editorProps: {
                transformPasted: (slice, view) =>
                    view.dragging ? slice : stripPastedImages(slice),
                handleDrop: dropTopLevelBlock,
                attributes: {
                    class: 'min-h-64 outline-none',
                    dir: direction,
                    'aria-label': 'محتوای مقاله',
                },
            },
        })
    }, [editor, disabled, direction])

    const selectImage = async () => {
        if (!editor || !onSelectImage || selectingImageRef.current || disabled)
            return
        selectingImageRef.current = true
        setSelectingImage(true)
        const revision = contentRevision.current
        try {
            const image = await onSelectImage()
            if (
                !image ||
                !mounted.current ||
                editor.isDestroyed ||
                !editor.isEditable ||
                revision !== contentRevision.current
            )
                return
            if (
                !image.mediaId ||
                !image.src ||
                /^\s*(?:data|javascript|vbscript):/i.test(image.src)
            ) {
                throw new Error('تصویر انتخاب شده معتبر نیست.')
            }
            editor
                .chain()
                .focus()
                .insertContent({ type: 'image', attrs: image })
                .run()
        } catch (error) {
            if (mounted.current) {
                if (callbacks.current.onImageError)
                    callbacks.current.onImageError(error)
                else toast.error(normalizeError(error).message)
            }
        } finally {
            selectingImageRef.current = false
            if (mounted.current) setSelectingImage(false)
        }
    }
    if (!editor) return null

    return (
        <div
            className={classNames(
                'rich-text-editor overflow-x-clip rounded-xl ring-1 ring-gray-200 dark:ring-gray-600 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 pt-3',
                editorState?.focused && 'ring-primary border-primary',
                invalid && 'bg-error-subtle',
                editorState?.focused &&
                    invalid &&
                    'bg-error-subtle ring-error border-error',
            )}
            aria-busy={selectingImage}
        >
            <BlockEditorToolbar
                editor={editor}
                disabled={disabled}
                selectingImage={selectingImage}
                canSelectImage={Boolean(onSelectImage)}
                onSelectImage={() => void selectImage()}
            />
            <div className="relative px-8 py-3">
                {!disabled && (
                    <DragHandle
                        editor={editor}
                        nested={{
                            edgeDetection:
                                direction === 'rtl' ? 'right' : 'left',
                            rules: [
                                {
                                    id: 'article-top-level-blocks',
                                    evaluate: ({ parent }) =>
                                        parent?.type.name === 'doc' ? 0 : 1000,
                                },
                            ],
                        }}
                        computePositionConfig={{
                            placement:
                                direction === 'rtl'
                                    ? 'right-start'
                                    : 'left-start',
                            strategy: 'absolute',
                        }}
                    >
                        <div
                            title="جابه جایی بلوک"
                            aria-label="جابه جایی بلوک"
                            className="tool-button text-xl heading-text hover:text-primary flex items-center p-1.5 rounded-lg cursor-grab"
                        >
                            <LuGripVertical aria-hidden="true" />
                        </div>
                    </DragHandle>
                )}
                <EditorContent
                    editor={editor}
                    dir={direction}
                    className="max-w-full [&_p]:my-2 [&_h2]:my-4 [&_h2]:text-2xl [&_h3]:my-3 [&_h3]:text-xl [&_h4]:my-2 [&_h4]:text-lg [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_blockquote]:border-s-4 [&_blockquote]:border-gray-300 [&_blockquote]:ps-4 [&_hr]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_table]:w-full [&_table]:table-fixed [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-200 dark:[&_th]:bg-gray-600 [&_td]:relative [&_th]:relative [&_.selectedCell]:bg-blue-100 dark:[&_.selectedCell]:bg-blue-900 [&_a]:text-primary [&_a]:underline [&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-primary"
                />
            </div>
        </div>
    )
}
