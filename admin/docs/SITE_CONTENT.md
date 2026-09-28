# Site content administration

The `features/site-content` feature uses the shared table, form, dialog,
language tabs, gallery and notification components. The panel stays Persian/RTL;
translated fields use their language's configured direction. Persian is required.

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

| Path | Methods |
| --- | --- |
| `about` | GET, PUT |
| `about/gallery` | PUT with `mediaIds` |
| `about/gallery/:id` | DELETE |
| `contacts` | GET, POST |
| `contacts/order` | PUT with `ids` |
| `contacts/:id` | PUT, DELETE |
| `location` | GET, PUT with both coordinates or both null |
| `messages` | GET with search, status, page, pageSize |
| `messages/:id` | GET, PATCH with status, DELETE |

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
