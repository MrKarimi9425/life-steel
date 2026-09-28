# Account security

There is no profile editor, avatar upload, resume form or
`/personal-information` route in this project.

The account dropdown opens the password-change dialog, composed from
`features/account-settings/components/SettingsSecurity.tsx`.
The same security form is used by `/change-password` when a temporary password
must be replaced. It uses Formik/Yup and submits `auth/password/change`,
then reloads `auth/me` and updates the authentication store.

First and last names returned with the principal are display data, not evidence
of a profile update endpoint. Owner-managed administrator operations live at
`/admins`. See [Authentication](AUTHENTICATION.md) and
[Administrator access](RBAC.md).
