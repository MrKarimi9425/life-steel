# Admin Architecture

## Implementation decision principles

Start with the simplest standard solution that satisfies the actual product
requirement. A solution is not considered good merely because it works; its
maintenance cost, consistency with the ecosystem, and developer experience are
part of the problem being solved.

- Confirm the expected user behavior before selecting an API, hook, or pattern.
- Treat suggestions as useful input, not as an architectural constraint; verify
  that the suggested tool matches the required behavior before adopting it.
- Prefer the established, direct solution provided by the current stack.
- Do not introduce a wrapper, registry, generator, adapter, or other abstraction
  until a concrete repeated need or limitation justifies it.
- Add complexity only after the simpler option has a demonstrated shortcoming,
  and document that shortcoming beside the decision.
- Validate a small end-to-end example in the real UI before applying a pattern
  across many files or features.
- When multiple approaches work, choose the one requiring the least project-
  specific knowledge for the next developer to understand and extend.

These principles apply to all implementation work, not only UI components or
the examples documented below.

## Application boundary

The admin is a client of the backend API. It does not define business rules, invent API contracts, or provide authorization by itself. Backend guards remain the authorization boundary.

The interface is Persian and RTL. Translation fields use the configured language
direction without changing the surrounding form. Staff accounts are OWNER or
ADMIN; only owner administration has an additional owner boundary.

## Source structure

```text
src/
├── app/          application providers, router, and render error boundary
├── assets/       imported images, SVG, and scoped vendor styles
├── components/
│   ├── layouts/  route shells and their structural components
│   ├── ui/       source-template UI primitives
│   └── shared/   reusable composed components
├── configs/      application, navigation, and route configuration
├── constants/    shared immutable values matching the source template
├── features/     business capabilities
├── hooks/        generic React hooks
├── lib/          API, query, and error infrastructure
└── utils/        pure generic utilities
```

Only directories with an active implementation exist.

## Application layer

`app/providers/AppProviders.tsx` composes React Query, the render error boundary, Browser Router, session synchronization, and toast notifications.

`app/router/AppRouter.tsx` defines all routes. `ProtectedRoute` bootstraps the
current principal. `OwnerRoute` limits access to administrator management but
does not replace backend authorization. Required password changes are enforced
by both the route guard and the backend.

## Layouts

`components/layouts/DashboardLayout/DashboardLayout.tsx` wraps feature content with the copied `components/layouts/PostLoginLayout/components/CollapsibleSide.tsx` composition. Its `SideNav`, `MobileNav`, `SideNavToggle`, and `VerticalMenuContent` dependency chain lives under `components/layouts/components`. The desktop sidebar switches between the source template's 290-pixel expanded and 80-pixel collapsed widths. `configs/navigation.config/index.ts` defines navigation entries and permission visibility, while `store/themeStore.ts` owns the shared collapsed state.

The dashboard shell uses a fixed-height viewport. The sidebar and header remain
outside the scroll region, while the content area below the header owns vertical
scrolling. All dashboard routes receive the same contained width and responsive
outer gutter from `DashboardLayout`.

## Features

Each capability owns its API calls, components, hooks, pages, schemas, stores, types, constants, and utilities when those folders are needed.

Current features:

- `auth`
- `dashboard`
- `account-settings`
- `admins`
- `languages`
- `catalog`
- `blog`
- `site-content`
- `media` (owner-scoped upload infrastructure, not a public library page)

Catalog, blog and contact resources reuse shared tables, dialogs, validation,
pagination and drag-ordering components where persisted ordering is meaningful.
Messages remain date ordered. The About page composes its form directly rather
than adding an unnecessary edit dialog or preview.

## State ownership

- TanStack React Query owns server state.
- Zustand owns shared client state.
- React component state owns small local UI state.
- Formik owns form state.
- Yup owns client-side form validation.

API data is not copied into Zustand. Modal visibility and similar local behavior are not promoted to a global store.

Products, articles and messages use server-side pagination; complete collections
such as contact channels use local filtering and pagination. Pages expose visible
page buttons and a page-size selector; changing search, filters, or page size
resets the page index to one. Query keys include the effective page index,
page size, search, and filters. Infinite queries and intersection observers are
reserved for interfaces whose product requirement is explicitly infinite
scroll, and must not be used to emulate button-based pagination.

SVG assets are imported directly in the consuming module with SVGR's `?react`
suffix and rendered as React components. Do not introduce a central icon-name
registry, icon wrapper, runtime SVG fetch, `dangerouslySetInnerHTML`, or a
generated sprite. Dynamic UI definitions store the imported SVG component
itself rather than a string icon name.

## Dependency direction

- `app` may compose layouts, features, components, and libraries.
- layout components may consume feature public exports and shared UI.
- features may consume shared components, hooks, libraries, configs, and utilities.
- `components/ui` does not import business features.
- `lib` does not import application features.
- cross-feature access uses the feature's public `index.ts` exports.

## Infrastructure

The shared Axios client owns transport configuration, Bearer-token injection,
and error normalization. The token-storage helper persists the JWT without
placing it in render state. React Query owns request caching and mutation
lifecycle. The shared error layer decides whether an error belongs in a form,
an inline query state, or a toast.

Detailed contracts are documented under `docs`.
