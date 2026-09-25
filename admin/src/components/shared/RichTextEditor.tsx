import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Props = {
    value: string
    onChange: (value: string) => void
    direction?: 'rtl' | 'ltr'
}

export default function RichTextEditor({
    value,
    onChange,
    direction = 'rtl',
}: Props) {
    const [linkUrl, setLinkUrl] = useState('')
    const [showLink, setShowLink] = useState(false)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: false,
            }),
            Link.configure({ openOnClick: false }),
        ],
        content: value || '<p></p>',
        immediatelyRender: false,
        onUpdate: ({ editor: current }) =>
            onChangeRef.current(current.getHTML()),
    })

    useEffect(() => {
        if (editor && editor.getHTML() !== (value || '<p></p>')) {
            editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
        }
    }, [editor, value])

    const setLink = () => {
        const url = linkUrl.trim()
        if (!url || !/^https?:\/\//i.test(url)) return
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        setLinkUrl('')
        setShowLink(false)
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().setParagraph().run()}>متن</Button>
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>تیتر ۲</Button>
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>تیتر ۳</Button>
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>ضخیم</Button>
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>فهرست</Button>
                <Button size="xs" type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>شماره دار</Button>
                <Button size="xs" type="button" onClick={() => setShowLink((current) => !current)}>لینک</Button>
            </div>
            {showLink && (
                <div className="flex gap-2 border-b border-gray-200 p-2 dark:border-gray-700">
                    <Input
                        dir="ltr"
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(event) => setLinkUrl(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                setLink()
                            }
                        }}
                    />
                    <Button size="xs" type="button" onClick={setLink}>ثبت لینک</Button>
                </div>
            )}
            <EditorContent
                className="rich-text-editor min-h-40 p-3"
                dir={direction}
                editor={editor}
            />
        </div>
    )
}
