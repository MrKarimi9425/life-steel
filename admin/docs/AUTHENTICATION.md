# Authentication

## Password sign-in

The panel accepts a phone number and password at `/sign-in`. There is no OTP,
SMS sign-in, membership request or public account registration.

1. The form normalizes the phone number.
2. `POST auth/password/sign-in` returns `data.accessToken` and sets a refresh cookie.
3. The shared token-storage helper persists the access token in localStorage.
4. `GET auth/me` loads the principal into the authentication store.
5. A principal with `mustChangePassword` is redirected to `/change-password`.

The legacy `/sign-in/password` route redirects to `/sign-in`.

## Session state and refresh

Zustand stores the lifecycle (`bootstrapping`, `authenticated`, `anonymous`) and
principal, not the token. The principal contains `userId`, `phoneNumber`,
`role`, `permissions`, `isOwner`, `mustChangePassword` and template-compatible
profile fields. Those profile fields do not imply a profile editing feature.

The shared Axios client sends Bearer authorization and credentials. A protected
request receiving 401 attempts `POST auth/refresh` once and retries with the new
access token. Concurrent failures share one refresh request. Password sign-in
and refresh requests are excluded from this retry loop.

The refresh cookie is HttpOnly, SameSite=Lax and Secure in production. The backend
rotates refresh tokens and tracks sessions. If refresh fails, the session
synchronizer clears the local session and query cache and redirects to sign-in
without an expired-session toast.

## Route protection

`ProtectedRoute` bootstraps `auth/me` only during the bootstrapping lifecycle.
Transport failures show a retry state rather than pretending the session is
invalid. Authenticated administrators may access content routes; `OwnerRoute`
restricts `/admins` to the owner. Backend guards are authoritative.

## Passwords and logout

The owner creates administrators and resets their passwords through `/admins`.
A temporary password is shown in the operation response and must be changed on
the next sign-in. No SMS is sent.

`POST auth/password/change` accepts the current and new password. The panel then
reloads the principal. Required changes use `/change-password`; voluntary changes
use the account dropdown's security dialog. Password changes revoke other
sessions while retaining the current one.

Logout calls `POST auth/logout` to revoke the current backend session and clear
the refresh cookie. Local token cleanup runs even if the request fails.
