# API integration

## Transport and envelopes

`src/lib/http/api-client.ts` is the shared Axios client. Configuration comes from
`configs/app.config.ts`; the default base URL is `/api/v1`.
Vite proxies `/api` to the backend on port 3000 without rewriting it.

The client adds Bearer authorization and sends cookies. One shared refresh
request handles concurrent 401 responses; each eligible request is retried only
once. See [Authentication](AUTHENTICATION.md).

Success responses use `{ message, data }`, where data may be null. Feature API
functions explicitly unwrap data where needed. General failures use
`{ error: { code, message } }`; field failures use `{ error: { code, fields } }`.
The shared normalizer owns parsing. See [Error handling](ERROR_HANDLING.md).

## Feature boundaries and queries

Requests and contracts belong to their feature. Existing flat files such as
`blog.api.ts` and `site-content.api.ts` remain valid; do not move them merely to
create a uniform directory tree. Cross-feature imports use public exports.

TanStack React Query owns server state. Keys include effective search, filters
and pagination for server-paginated lists. Lists returned as complete collections,
such as contact records, can search and paginate locally. Do not concatenate
pages or substitute infinite scroll for page controls.

The default stale time is 30 seconds; refetch on window focus is disabled.
Entity detail and gallery queries mount only when needed. Related language and
taxonomy options reuse shared queries. Invalidate the changed resource rather
than all feature lists.

Mutation success/error toasts are centralized in the query client. Explicit
notifications can suppress the global channel through mutation metadata.
Blocking query states provide retry controls. Field errors belong in the form.

## Resource groups

Paths below are relative to `/api/v1`:

- `auth/password/sign-in`, `auth/me`, `auth/refresh`,
  `auth/password/change`, `auth/logout`
- `admins`: owner-only administrator management
- `languages`, `languages/interface-phrases`
- `catalog/categories`, `catalog/attributes`, `catalog/products`,
  product detail/pricing/order operations and `catalog/product-options`
- `blog/articles`, `blog/categories`, `blog/tags`
- `media`: uploads, translations and deletion used by scoped galleries;
  there is no general media-library route in the panel
- `dashboard/summary`
- `site-content/about`, `site-content/contacts`,
  `site-content/location`, `site-content/messages`

Method-specific contracts are defined by backend controllers/DTOs and Swagger
at `/api/docs`, not by copied template examples.
Public data groups are `public/languages`, `public/products`, `public/blog`
and `public/site-content`. [Site content](SITE_CONTENT.md) lists its contracts.
