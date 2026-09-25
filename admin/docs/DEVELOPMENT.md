# Admin Development

## Feature structure

```text
features/feature-name/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── store/
├── types/
├── constants/
├── utils/
└── index.ts
```

Only required folders are created. A page is a route entry and composes feature components; it does not own raw HTTP calls or error parsing.

## State selection

- remote data and mutations: React Query
- shared client-only state: Zustand
- local component state: React state
- form state and submission: Formik
- form validation: Yup

## New screen workflow

1. Confirm the backend contract.
2. Find the corresponding source-template screen.
3. Copy or compose the required source UI.
4. Add feature API functions and React Query hooks.
5. Add Formik and Yup for forms.
6. Route errors through the shared error layer.
7. Add the route and role boundary.
8. Validate the active states.

## Structural refactoring

Folder refactors preserve runtime behavior, route paths, Persian labels, RTL behavior, and visual output. Unrelated defects are reported rather than included silently.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

The admin currently has no automated UI test framework. Structural and interactive changes are manually checked through the active routes after the static validation commands pass.

## Documentation ownership

- HTTP usage: `docs/API_INTEGRATION.md`
- session behavior: `docs/AUTHENTICATION.md`
- error routing: `docs/ERROR_HANDLING.md`
- source-template rules: `docs/UI_SOURCE.md`
- folder and dependency architecture: `ARCHITECTURE.md`
