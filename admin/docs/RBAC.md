# Roles and Permissions

## Page

`/roles-permissions` is based on the source template's
`concepts/account/roles-permissions` page. It keeps the role-card, permission
segment, dialog, and user-table interaction model while using this project's
API, form, state, and error infrastructure.

The page shows:

- role cards with permission sets and a small authentication-user preview
- a Formik/Yup create or edit role dialog
- an authentication-user table with phone number, status, creation date, and role
- server-side search, filters, and pagination
- role assignment when `UserRole:assign` is granted

No profile fields are displayed or stored in the authentication user feature.

## State and authorization

React Query owns roles, permissions, and user-list server state. Zustand owns
table filters and dialog state. Formik and Yup own role form state and
validation. The permission catalog is defined by implemented backend
operations; administrators assign its entries to roles but do not create
arbitrary permissions.

The route requires `Role:view`. Creating a role requires `Role:create`, editing
requires `Role:update`, loading the user table requires `UserRole:view`, and
assigning a role requires `UserRole:assign`.
These checks affect visibility and interaction only. The backend permission
guard is authoritative.

Account settings uses `Profile:view` to expose the profile section and
`Profile:update` to enable form and avatar actions. The permission catalog
labels both operations under profile management.

The `/clients` table applies the same rule to account operations. Status
changes are shown only with `AdminClient:changeStatus`, and permanent deletion
is shown only with `AdminClient:delete`. Both operations use the shared API
client, React Query cache invalidation, and global operational error toasts.

The `/access-requests` page requires `AccessRequest:view`. Approval and
unblocking require `AccessRequest:approve`; rejection requires
`AccessRequest:reject` and a reason. These actions invalidate both the request
list and the pending-count badge.
