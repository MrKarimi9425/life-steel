# Life Steel Backend

Versioned NestJS API with Prisma and MySQL. Active business modules:
auth, admins, languages, media, catalog, dashboard, blog and site-content.

The dependency flow is Controller -> Service -> Repository -> Prisma where
repositories are defined. Request DTOs reject unknown properties. Administrators
sign in with passwords; the owner manages administrators. No OTP, customer
registration, configurable role system, SMS or online checkout is implemented.

## Local setup

Copy `.env.example` to `.env` and set local database, token and owner values.
Never put real credentials in the example file or Git.

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Seed is repeatable and does not overwrite interface translations edited in the
panel. Uploaded files use MEDIA_STORAGE_PATH and need persistent storage.

## Contracts

The API base is `/api/v1`; Swagger is served at `/api/docs`.
Successes use `{ message, data }`. Errors are normalized by the shared HTTP layer.
Authentication returns a Bearer access token, sets an HttpOnly refresh cookie,
rotates refresh sessions and supports server-side logout.

Products support private galleries, block descriptions, selected color options,
optional public price ranges and color-linked images. Disabling public prices
retains stored amounts but excludes them from public responses.
Blog content is validated Tiptap JSON; published localized data is separate from
administrator drafts.

Site content has about translations/gallery, typed translated contact records,
one coordinate pair and manually managed contact messages. The migration
`20260927020000_site_content_contact` creates these models. See
[Site content contracts](../admin/docs/SITE_CONTENT.md).

## Validation

```powershell
npm run build
npm run lint
npm test -- --runInBand
```

The lint script can fix files; review changes when running it.
Do not commit generated upload files or environment credentials.
The public contact submission currently has no dedicated anti-spam/rate-limit
policy. Product sitemap pagination is implemented in the web application and
reads all returned pages for each language.
