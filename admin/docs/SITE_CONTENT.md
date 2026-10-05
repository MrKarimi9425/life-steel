# Site content administration

The `features/site-content` feature uses the shared table, form, dialog,
language tabs, gallery and notification components. The panel stays Persian/RTL;
translated fields use their language's configured direction. Persian is required.

## Homepage layout and site banners

Homepage responsibilities are split between two routes:

- `/site/home-layout` only manages section order and visibility. Hero is
  permanently fixed as the first active section. Every other core or custom
  section can be reordered and enabled or disabled here.
- `/site/banners` manages banner content for the site. Administrators can add an
  unlimited number of homepage banner sections with either one full-width
  banner or exactly two side-by-side banners. The same list includes the fixed
  product-catalog and blog banner sections, which cannot be renamed, reordered
  or deleted.
  `/site/banners/:sectionId` is the focused workspace for the banners, images
  and ordering of one section. Custom sections can be renamed and permanently
  deleted from the list. Their order and visibility remain the layout page's
  concern.

Hero is a slider and accepts an unlimited number of slides. Each banner has its
own localized alternative text and optional target URL, plus desktop, tablet
and mobile artwork for every saved language. Persian is required. An internal
path is prefixed with the current locale; external HTTP/HTTPS targets open in a
new tab. An empty target renders a non-clickable banner. All three images are
required for every saved language before publication.

The product-catalog section accepts one published banner and is not part of the
homepage ordering table. Its recommended artwork sizes are 1440 by 300 pixels
for desktop, 1024 by 320 for tablet and 750 by 420 for mobile. The public site
renders it only when all three localized images are available.

The blog section follows the same fixed-section rules, capacity, responsive
artwork sizes and localized publication requirements. The public site renders
its banner after the article list and pagination.

The image action uses the shared upload-progress component without cropping the
designer's finished artwork. Images belong exclusively to one slide language and viewport;
replacing or deleting one removes its previous file, and incomplete cleanup is
reported. The shared tables support search, pagination, drag ordering and
permanent deletion with confirmation. The website rotates multiple published
Hero slides and pauses while the visitor interacts with the banner. Full-width
and split banner sections render in their administrator-defined position; split
banners stack on mobile.

Split banner sections replace the former fixed promotional-card section. Their
two localized artworks and links are managed entirely through the banner
workspace instead of borrowing product or about-page content.

## Homepage settings

`/site/home-settings` controls the number of ordered products rendered in the
homepage selected-products rail. The persisted value is an integer from 1 to 8
and defaults to 6. Product order continues to come from catalog ordering. The
website keeps three fixed-width cards visible on desktop; fewer records leave
unused space and additional records remain available through horizontal scroll.

## About

`/site/about` displays the form directly in the page, without a preview or an
edit-form dialog. It edits translated title, block content, SEO title/description,
and the page-wide manual publication flag. Untranslated languages are omitted
from public content; there is no separate per-translation publication switch.

The dedicated gallery is an independent dialog and save cycle. It reuses
`ScopedMediaPicker`, crop/upload progress and the image selection dialog.
Images inserted into block content must belong to this gallery. Images referenced
by saved content cannot be removed. Permanent removal of unreferenced owned
images also deletes files where safe; incomplete cleanup is reported.

Gallery changes refresh the about query; unchanged translation data does not
reset unsaved form content merely because the gallery changes.

## Contact information

`/site/contacts` manages an unlimited number of records with types PHONE,
EMAIL, ADDRESS, HOURS or LINK. Each record has translated display title/value
and a visibility flag. Phone/email/URL values use LTR even for RTL translations.

The table searches and paginates the returned collection locally. Drag ordering
updates the visible records' existing ordering slots and rolls back optimistic
cache changes on failure. The page-size options include 1,000.
Permanent deletion uses the shared confirmation dialog.

## Location

The location dialog selects a point by clicking a Neshan map; coordinates are
shown as read-only information, not editable inputs. Selecting another point
changes the draft. Clearing the selection and saving sends both coordinates as
null. Closing without saving retains the persisted location.

`components/shared/MapLocationPicker.tsx` owns map lifecycle and selection.
`utils/watchMapTiles.ts` checks visible raster images together: a failed tile
alone is not a whole-map error. An unavailable message clears during a new load
or successful recovery. Event listeners and observers are disposed on unmount.

## Messages

`/site/messages` uses server pagination and search/status filters. Messages
remain in date order, not administrator-defined drag order. Opening a message
loads detail but does not automatically change its status. Status changes are
manual: NEW, READ or FOLLOWED_UP. Permanent deletion requires confirmation.
No SMS, email notification or automatic follow-up is sent.

## API

Paths are relative to `/api/v1/site-content` and require completed administrator
authentication:

| Path                       | Methods                                           |
| -------------------------- | ------------------------------------------------- |
| `settings`                 | GET, PUT with `selectedProductsLimit` from 1 to 8 |
| `home-sections`            | GET, POST                                         |
| `home-sections/order`      | PUT with `ids`                                    |
| `home-sections/:id`        | PUT, DELETE                                       |
| `home-sections/:id/status` | PATCH with `isActive`                             |
| `banners`                  | GET, POST                                         |
| `banners/order`            | PUT with `ids`                                    |
| `banners/:id`              | PUT, DELETE                                       |
| `banners/:id/image`        | PUT with `mediaId`, DELETE                        |
| `about`                    | GET, PUT                                          |
| `about/gallery`            | PUT with `mediaIds`                               |
| `about/gallery/:id`        | DELETE                                            |
| `contacts`                 | GET, POST                                         |
| `contacts/order`           | PUT with `ids`                                    |
| `contacts/:id`             | PUT, DELETE                                       |
| `location`                 | GET, PUT with both coordinates or both null       |
| `messages`                 | GET with search, status, page, pageSize           |
| `messages/:id`             | GET, PATCH with status, DELETE                    |

Public read: `GET /api/v1/public/site-content/:language`.
Public submission: `POST /api/v1/public/site-content/messages`.

## Map configuration

Set `VITE_NESHAN_WEB_API_KEY` in ignored `admin/.env.local` and
`NEXT_PUBLIC_NESHAN_WEB_API_KEY` in ignored `web/.env.local`.
Example environment files contain empty keys. Web keys are visible in browser
bundles: use Neshan's permitted-domain settings and account credit controls.
There is no backend service key needed for clicking a point on a map.

The website opens Balad on desktop, a generic geo link on Android, and Apple Maps
on iOS. Device/browser handling determines the actual mobile application.
The website adds no custom attribution strip; native SDK attribution remains.
