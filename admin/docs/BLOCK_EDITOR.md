# Block editor component

`components/shared/BlockEditor` is the controlled, JSON-based Tiptap editor shared by articles, products and About content. It does not fetch or save records itself. Each host owns its form, validation and scoped gallery integration.

## Host contract

- Pass `value` as a Tiptap document or `null` for an empty document.
- Handle `onChange` to store the updated JSON in the host form.
- Pass `direction` per translation. It changes content direction without changing the surrounding form.
- Pass `disabled` during operations that must prevent editing, and `invalid` for field validation styling.
- Supply `onSelectImage` to open an owner-scoped gallery and resolve a selected `{ mediaId, src, alt, title? }` image, or `null` when cancelled. Without this callback, insertion is disabled.
- Supply `onImageError` to use host-specific error handling. Otherwise errors use the shared normalizer and toast.
- Keep the component mounted while selecting an image, or resolve cancellation when closing the host. A result received after unmount, content replacement, direction change or disabling is not inserted.

## Content and tools

The document supports paragraphs, headings 2 through 4, formatted text, links, bullet and ordered lists, blockquotes, horizontal rules, gallery images and tables. The toolbar provides block movement, deletion, undo and redo. A Tiptap drag handle targets top-level blocks; table cells and list children are not independent drag targets.

Images retain their `mediaId` in JSON and a `data-media-id` HTML attribute. Pasted images are stripped so users select media through the host gallery. This is a UI rule, not authorization: the receiving API must validate document structure, URLs and image ownership before persistence or publication. The editor does not provide public HTML rendering or server-side sanitization.

Table controls add or delete rows and columns, merge or split cells, and delete tables. Block movement buttons provide an alternative to pointer dragging on small screens and for keyboard users.

Handle-owned block drops snap to top-level boundaries, so dropping onto a paragraph
does not merge its text. Internal drags preserve gallery images; clipboard images
are stripped. Keep the drop and paste handlers when changing editor options.

The toolbar button and outer editor structure are adapted from the source template's RichTextEditor. Image, table and block controls are the approved extensions to that pattern. The existing product editor is unchanged.
