# Profile Settings

## Page

Profile editing is available on the dedicated `/personal-information` route
and appears as **Personal information** in the account section of the sidebar.

Profile API, hooks, schema, types, page, and form components live under
`src/features/profile`. Password setup and change are available from the
account dropdown modal and remain isolated under `src/features/account-settings`.

The form covers identity, contact details, resume summary, and availability.
Profile links are outside the current phase.

Every field is optional. Validation only checks format and maximum length when
a value is present.

## Source layout

The page uses the source template's `concepts/orders/order-create` composition:
a fixed navigator card on large screens, separate content cards, a responsive
single-column flow, and a bottom action bar fixed to the viewport. Navigator
descriptions are truncated to one line.

## State and validation

- React Query owns `GET profile/me` and the cached profile.
- Formik owns form state and submission.
- Yup validates fields before submission.
- The shared error handler maps backend field errors into Formik and sends
  operational errors to the global toast channel.

The route and sidebar item require `Profile:view`. Inputs and avatar actions require
`Profile:update`. Backend guards remain authoritative.

## Avatar upload

The form accepts JPEG, PNG, or WebP images up to 2 MB and shows an immediate
local preview. Save sends the image and text fields together as
`multipart/form-data`. Removal is persisted only when the form is saved.

The backend currently serves uploaded avatars from `/api/public/uploads`.
Frontend code consumes the returned path and does not depend on the underlying
storage implementation.
