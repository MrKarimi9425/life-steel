import type { Slice } from '@tiptap/pm/model'
import { Selection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

/** Handle-owned blocks move between top-level nodes, never into their text. */
export function dropTopLevelBlock(
    view: EditorView,
    event: DragEvent,
    _slice: Slice,
    moved: boolean,
): boolean {
    const { selection, doc } = view.state
    if (
        !moved ||
        selection.empty ||
        selection.$from.depth !== 0 ||
        selection.$to.depth !== 0
    )
        return false
    const hit = view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (!hit) return false
    const resolved = doc.resolve(hit.pos)
    let target = hit.pos
    if (resolved.depth > 0) {
        const start = resolved.before(1)
        const element = view.nodeDOM(start)
        const rect =
            element instanceof HTMLElement
                ? element.getBoundingClientRect()
                : null
        target =
            rect && event.clientY > rect.top + rect.height / 2
                ? resolved.after(1)
                : start
    }
    event.preventDefault()
    if (target >= selection.from && target <= selection.to) return true
    const content = doc.slice(selection.from, selection.to).content
    const transaction = view.state.tr.delete(selection.from, selection.to)
    const insertion = transaction.mapping.map(target)
    transaction.insert(insertion, content)
    transaction.setSelection(Selection.near(transaction.doc.resolve(insertion)))
    view.dispatch(transaction.scrollIntoView())
    return true
}
