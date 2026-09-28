# Life Steel Admin

Persian/RTL React and Vite panel using the copied Studio/template components.
Content-language direction applies to translated fields, not the whole panel.

Current features: administrators, languages, interface phrases, catalog categories,
attributes, products with color pricing and private galleries, blog, about,
contact information, map location and contact messages. There is no public
registration, OTP login, configurable RBAC or general media-library page.

## Local setup

```powershell
npm install
npm run dev
```

Vite proxies `/api` to port 3000. Login uses a phone number and password.
The owner can create administrators and reset temporary passwords. Temporary
passwords must be replaced on first sign-in; no SMS is sent.
Configure the Neshan web key in ignored `.env.local` using the variable name in
`.env.example`, without committing a real key.

## Documentation

Start with the project-independent [panel development guide](../docs/admin-panel-development-guide.md).
Project contracts: [Architecture](ARCHITECTURE.md),
[Development](docs/DEVELOPMENT.md), [Navigation](docs/NAVIGATION.md),
[Authentication](docs/AUTHENTICATION.md), [Access](docs/RBAC.md),
[API](docs/API_INTEGRATION.md), [Errors](docs/ERROR_HANDLING.md),
[Products](docs/PRODUCTS.md), [Blog](docs/BLOG.md),
[Block editor](docs/BLOCK_EDITOR.md), [Site content](docs/SITE_CONTENT.md).

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
```

Interactive states are checked manually in the browser; no automated admin UI
test framework is configured.
