# Life Steel Web

Multilingual Next.js site using localized published API data. The current visual
design is provisional; it is not the final approved site design.

## Routes

- `/{locale}`: home
- `/{locale}/products`: product search/filter list
- `/{locale}/products/{slug}`: product detail, color selection, pricing and gallery
- `/{locale}/blog`: article search/category/tag filters and pagination
- `/{locale}/blog/{slug}`: block content, gallery and category-derived related articles
- `/{locale}/about`: published translated about content and private gallery
- `/{locale}/contact`: typed contact information, map and contact form

Products without visible prices show contact text. Selecting a color changes
only the hero image, not the complete gallery. There is no cart or checkout.
The page direction comes from the active language's direction setting.

## Contact and maps

Neshan's Leaflet SDK displays the location saved from the admin map picker.
The map is hidden unless both coordinates exist. Clicking opens Balad on desktop,
a geo link on Android, or Apple Maps on iOS. Mobile handling depends on the device.
No custom attribution footer is rendered; native SDK attribution remains.

The form accepts name, phone, optional email, subject and message. It normalizes
Persian/Arabic phone digits, validates input and submits through the same-origin
`/api/contact-message` rewrite to the backend. It does not send notifications.
Partial tile errors do not imply that the whole map is unavailable.

## SEO

Article metadata includes localized title/description, canonical, hreflang,
Open Graph, Twitter cards and Article structured data. About/contact metadata
uses the site-content helpers; unpublished about content is noindex.
Sitemap and robots routes exist.

Product and article sitemap generation paginate through all returned records
for each language. Product slugs are URL encoded and duplicate URLs are omitted.
Home, product/blog lists, product detail, About and contact use the shared
`lib/page-seo.ts` canonical and social metadata builder. List canonical and
language links retain supported filters and page numbers greater than one;
unknown query keys are omitted. About language links include only published
translations. Product detail shares its cover image when available and does
not add price data to metadata. Product-detail cross-language links are not
invented from the current-language slug; the current API provides only that
translation. Article structured data remains separate in `lib/blog-seo.ts`.

## Local setup

```powershell
npm install
npm run dev
```

Default URL: `http://localhost:3001/fa`.
API_PROXY_TARGET defaults to `http://127.0.0.1:3000`.
Set NEXT_PUBLIC_SITE_URL to the real site origin for deployment.
Set NEXT_PUBLIC_NESHAN_WEB_API_KEY in ignored `.env.local`. It is a browser-visible
web key; configure permitted domains and account credit in Neshan's panel.
Do not commit real keys or add them to `.env.example`.

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
```

Public contact submissions currently have no dedicated anti-spam/rate-limit
policy. Current rendering and metadata behavior are documented here; this file
is not a feature roadmap.
