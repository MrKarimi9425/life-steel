# Product administration

Product pages compose reusable dialogs and table actions in the catalog feature.
Pricing is managed through a separate table action and does not lengthen the
main product form.

## Pricing

`GET/PUT catalog/products/:id/pricing` reads and replaces the pricing configuration.
Amounts are positive integer toman values, transported as decimal strings and
stored as database BigInt values. Blank amounts mean contact for pricing.

The independent `showPrice` switch controls public disclosure, not storage.
Disabling it retains all amounts in administration while removing amount,
base-price and range fields from public API responses.

Selected active options of existing COLOR attributes supply the price rows.
Products without selected colors use a base price. Public product detail supports
color selection; an unselected color shows the minimum/maximum of priced colors,
or one price when they are equal. Missing color prices show contact text.
Public list and related-product pricing are loaded in one batched query.

## Color images

Each selected color can reference multiple images from its product gallery and
one primary image among those references. The pricing dialog reuses the shared
image-selection grid for multi-selection and primary-image selection. These
connections remain public even when price display is disabled, without exposing
amounts. Selecting a color changes only the public hero image; the complete
gallery remains unchanged. Colors without an image use the default product
cover. Removing a gallery image removes its color connections; gallery reordering
preserves connections for retained images. Disconnecting an image from a color
does not delete the underlying file.

## Descriptions

Product descriptions use the same shared BlockEditor and public BlockContent
renderer as articles. Translated content is stored as validated Tiptap JSON.
Legacy descriptions remain stored and are converted when opened in the editor;
public pages retain the legacy rendering fallback until block content is saved.

The image picker is restricted to the product's own gallery. Images referenced
by saved block content cannot be deleted from that gallery until removed from
the saved descriptions. The panel remains Persian and RTL; the editor direction
follows the selected content language.
