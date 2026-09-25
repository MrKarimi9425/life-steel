# API Integration

## Shared client

`src/lib/http/api-client.ts` is the only Axios instance used by features. It reads the base URL and timeout from `src/configs/app.config.ts` and sends JSON.

Its request interceptor reads the token through the shared storage helper and
adds `Authorization: Bearer <token>`. Authentication failures remove the token
before publishing the global session-expired event.

## Development proxy

The default API base is `/api/v1`. Vite proxies `/api` to `http://127.0.0.1:3000` without rewriting the request path.

## Response contracts

All successful backend endpoints return:

```ts
type ApiResponse<T> = {
    message: string
    data: T | null
}
```

General backend errors use `{ error: { code, message } }`; field errors use
`{ error: { code, fields } }`. A response never contains both error display
channels. The Axios interceptor does not unwrap responses; feature API functions
unwrap `data` explicitly.

## Feature API organization

Each feature owns its request functions in `features/<feature>/api`. Query keys and request functions use backend resource names. React components do not call Axios directly.

React Query hooks live in the feature's `hooks` directory and own query configuration, mutation success behavior, and cache invalidation.

Server-backed resource lists use `useQuery` with explicit `pageIndex` and
`pageSize` state. Both values are included in the query key and sent with every
request. The UI renders the backend page directly alongside visible page
buttons and a page-size selector; it never concatenates pages. Search and
filter changes reset `pageIndex` to one. Resource mutations invalidate the
resource query-key prefix.

## Current integrations

The admin currently calls:

- `auth/request-otp`
- `auth/verify-otp`
- `auth/password/sign-in`
- `auth/me`
- `auth/password/setup`
- `auth/password/change`
- `admin/clients` with GET and POST
- `rbac/roles`
- `rbac/permissions`
- `rbac/users`
- `profile/me` with GET and multipart PUT
- `service-offerings`
- `event-types`

`auth/request-otp` returns only `data: { time }`, where `time` is the remaining
lifetime in milliseconds calculated by the backend. The frontend converts it
to a countdown deadline when the response arrives. If a challenge is already
active, the response contains its actual remaining time.

The profile update sends all profile fields, optional avatar bytes, and the
avatar-removal flag in one `multipart/form-data` request. The returned profile
replaces the React Query cache entry.
