# Authentication

## OTP sign-in

1. The user enters an Iranian mobile number.
2. The form normalizes Persian or English digits and converts the number to the backend format.
3. `POST auth/request-otp` returns a state discriminator. Existing active users
   receive `OTP_SENT` with the backend-calculated remaining milliseconds.
4. The same page displays five OTP inputs.
5. `POST auth/verify-otp` returns `data.accessToken`, which the auth API stores.
6. The admin fetches `GET auth/me` and stores the returned principal.
7. The user enters the protected dashboard.

The temporary phone number and locally derived expiry are stored in
`sessionStorage` under the OTP-flow Zustand store so the countdown continues
across page reloads. These values are not authentication credentials.

When a challenge is still active, `time` contains only its actual remaining
lifetime and the API message tells the user that the current code is still valid.

An unknown phone number automatically creates one membership request instead
of entering the OTP step. The form displays the pending state on subsequent
attempts. If an administrator rejected the request, the form displays the
required rejection reason. Rejected applicants cannot submit a duplicate
request; administrator approval also serves as unblocking. SMS notification is
not implemented yet, so approved applicants proceed on their next sign-in.

## Session state

The authentication Zustand store contains only:

- lifecycle status: `bootstrapping`, `authenticated`, or `anonymous`
- principal: `userId`, `role`, `permissions`, and `hasPassword`

It does not contain the token. The shared token-storage helper persists the JWT
in `localStorage`, independently of render state.

## Route protection

`ProtectedRoute` fetches `auth/me` only while the lifecycle is bootstrapping. An authenticated principal renders protected routes; an anonymous state redirects to `/sign-in`.

`PermissionRoute` checks the in-memory principal for client-side routing. The
backend performs the actual authorization.

## Expired sessions

The shared HTTP client publishes authentication failures. `AuthSessionSynchronizer` reacts only when the current state is authenticated, then:

1. sets the auth store to anonymous
2. clears the React Query cache
3. redirects to `/sign-in`

No authentication error toast is displayed for this flow.

## Logout and passwords

Logout removes the persisted token, clears local auth state and the
current-principal query, and navigates to sign-in. It does not make a backend
request because the current JWT is stateless.

Account settings use `hasPassword` to choose between initial password setup and
password change. The password sign-in page submits the normalized phone number
and password, then loads `auth/me` and establishes the same client-side session
state as OTP sign-in.
