import { useState } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import {
    LuBold,
    LuItalic,
    LuUnderline,
    LuStrikethrough,
    LuHeading2,
    LuHeading3,
    LuHeading4,
    LuPilcrow,
    LuList,
    LuListOrdered,
    LuQuote,
    LuMinus,
    LuImage,
    LuTable,
    LuUndo2,
    LuRedo2,
    LuArrowUp,
    LuArrowDown,
    LuTrash2,
    LuLink,
    LuUnlink,
} from 'react-icons/lu'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import BlockEditorToolButton from './BlockEditorToolButton'
import {
    deleteCurrentBlock,
    getCurrentBlock,
    moveCurrentBlock,
} from './block-editor.commands'

type Props = {
    editor: Editor
    disabled: boolean
    selectingImage: boolean
    canSelectImage: boolean
    onSelectImage: () => void
}

export default function BlockEditorToolbar({
    editor,
    disabled,
    selectingImage,
    canSelectImage,
    onSelectImage,
}: Props) {
    const [linkUrl, setLinkUrl] = useState('')
    const [showLink, setShowLink] = useState(false)
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            strike: current.isActive('strike'),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            blockquote: current.isActive('blockquote'),
            paragraph: current.isActive('paragraph'),
            h2: current.isActive('heading', { level: 2 }),
            h3: current.isActive('heading', { level: 3 }),
            h4: current.isActive('heading', { level: 4 }),
            table: current.isActive('table'),
            link: current.isActive('link'),
            undo: current.can().undo(),
            redo: current.can().redo(),
            blockIndex: getCurrentBlock(current).index,
            blockCount: current.state.doc.childCount,
        }),
    })
    const buttons = [
        {
            title: 'متن',
            icon: <LuPilcrow />,
            active: state.paragraph,
            action: () => editor.chain().focus().setParagraph().run(),
        },
        {
            title: 'تیتر ۲',
            icon: <LuHeading2 />,
            active: state.h2,
            action: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            title: 'تیتر ۳',
            icon: <LuHeading3 />,
            active: state.h3,
            action: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            title: 'تیتر ۴',
            icon: <LuHeading4 />,
            active: state.h4,
            action: () =>
                editor.chain().focus().toggleHeading({ level: 4 }).run(),
        },
        {
            title: 'ضخیم',
            icon: <LuBold />,
            active: state.bold,
            action: () => editor.chain().focus().toggleBold().run(),
        },
        {
            title: 'مورب',
            icon: <LuItalic />,
            active: state.italic,
            action: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            title: 'زیرخط',
            icon: <LuUnderline />,
            active: state.underline,
            action: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
            title: 'خط خورده',
            icon: <LuStrikethrough />,
            active: state.strike,
            action: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            title: 'فهرست',
            icon: <LuList />,
            active: state.bulletList,
            action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            title: 'فهرست شماره دار',
            icon: <LuListOrdered />,
            active: state.orderedList,
            action: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            title: 'نقل قول',
            icon: <LuQuote />,
            active: state.blockquote,
            action: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            title: 'جداکننده',
            icon: <LuMinus />,
            action: () => editor.chain().focus().setHorizontalRule().run(),
        },
    ]
    const setLink = () => {
        const href = linkUrl.trim()
        if (!/^https?:\/\//i.test(href)) return
        editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
        setShowLink(false)
        setLinkUrl('')
    }

    return (
        <>
            <div
                className="flex flex-wrap gap-x-1 gap-y-2 px-2"
                role="toolbar"
                aria-label="ابزارهای ویرایش متن"
            >
                {buttons.map((button) => (
                    <BlockEditorToolButton
                        key={button.title}
                        title={button.title}
                        active={button.active}
                        disabled={disabled}
                        onClick={button.action}
                    >
                        {button.icon}
                    </BlockEditorToolButton>
                ))}
                <BlockEditorToolButton
                    title="افزودن لینک"
                    active={state.link}
                    disabled={disabled}
                    onClick={() => {
                        setLinkUrl(editor.getAttributes('link').href ?? '')
                        setShowLink(!showLink)
                    }}
                >
                    <LuLink />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="حذف لینک"
                    disabled={disabled || !state.link}
                    onClick={() => editor.chain().focus().unsetLink().run()}
                >
                    <LuUnlink />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="تصویر از گالری"
                    disabled={disabled || selectingImage || !canSelectImage}
                    onClick={onSelectImage}
                >
                    <LuImage />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="افزودن جدول"
                    disabled={disabled}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                >
                    <LuTable />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="انتقال بلوک به بالا"
                    disabled={disabled || state.blockIndex === 0}
                    onClick={() => moveCurrentBlock(editor, -1)}
                >
                    <LuArrowUp />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="انتقال بلوک به پایین"
                    disabled={
                        disabled || state.blockIndex >= state.blockCount - 1
                    }
                    onClick={() => moveCurrentBlock(editor, 1)}
                >
                    <LuArrowDown />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="حذف بلوک"
                    disabled={disabled}
                    onClick={() => deleteCurrentBlock(editor)}
                >
                    <LuTrash2 />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="بازگردانی"
                    disabled={disabled || !state.undo}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <LuUndo2 />
                </BlockEditorToolButton>
                <BlockEditorToolButton
                    title="انجام دوباره"
                    disabled={disabled || !state.redo}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <LuRedo2 />
                </BlockEditorToolButton>
            </div>
            {showLink && (
                <div className="flex gap-2 px-2 py-2">
                    <Input
                        dir="ltr"
                        aria-label="آدرس لینک"
                        placeholder="https://..."
                        disabled={disabled}
                        value={linkUrl}
                        onChange={(event) => setLinkUrl(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                setLink()
                            }
                        }}
                    />
                    <Button
                        type="button"
                        size="sm"
                        disabled={
                            disabled || !/^https?:\/\//i.test(linkUrl.trim())
                        }
                        onClick={setLink}
                    >
                        ثبت
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowLink(false)}
                    >
                        انصراف
                    </Button>
                </div>
            )}
            {state.table && (
                <div
                    className="flex flex-wrap gap-1 px-2 py-2"
                    role="toolbar"
                    aria-label="ابزارهای جدول"
                >
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().addRowAfter().run()
                        }
                    >
                        افزودن سطر
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().addColumnAfter().run()
                        }
                    >
                        افزودن ستون
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled}
                        onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                        حذف سطر
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().deleteColumn().run()
                        }
                    >
                        حذف ستون
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled || !editor.can().mergeCells()}
                        onClick={() =>
                            editor.chain().focus().mergeCells().run()
                        }
                    >
                        ادغام
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled || !editor.can().splitCell()}
                        onClick={() => editor.chain().focus().splitCell().run()}
                    >
                        تفکیک
                    </Button>
                    <Button
                        size="xs"
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().deleteTable().run()
                        }
                    >
                        حذف جدول
                    </Button>
                </div>
            )}
        </>
    )
}
