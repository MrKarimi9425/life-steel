import type { Editor } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'

export function getCurrentBlock(editor: Editor) {
    const { $from } = editor.state.selection
    const index = Math.min($from.index(0), editor.state.doc.childCount - 1)
    const node = editor.state.doc.child(index)
    let position = 0
    for (let current = 0; current < index; current++) {
        position += editor.state.doc.child(current).nodeSize
    }
    return { index, node, position }
}

export function moveCurrentBlock(editor: Editor, offset: -1 | 1) {
    const { index, node, position } = getCurrentBlock(editor)
    const targetIndex = index + offset
    if (targetIndex < 0 || targetIndex >= editor.state.doc.childCount)
        return false
    const neighbor = editor.state.doc.child(targetIndex)
    const insertionPosition =
        offset === -1
            ? position - neighbor.nodeSize
            : position + neighbor.nodeSize
    const transaction = editor.state.tr
        .delete(position, position + node.nodeSize)
        .insert(insertionPosition, node)
    transaction.setSelection(
        NodeSelection.create(transaction.doc, insertionPosition),
    )
    editor.view.dispatch(transaction.scrollIntoView())
    editor.view.focus()
    return true
}

export function deleteCurrentBlock(editor: Editor) {
    const { node, position } = getCurrentBlock(editor)
    return editor
        .chain()
        .focus()
        .deleteRange({
            from: position,
            to: position + node.nodeSize,
        })
        .run()
}
