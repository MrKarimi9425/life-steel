# Admin Agent Rules

These rules apply to every change under `admin`.

## Required workflow

1. Inspect the existing feature and its import graph.
2. Find the matching interface in the source template.
3. Confirm the backend DTO and response contract.
4. Plan the smallest coherent change.
5. Copy and adapt the required source-template code without redesigning it.
6. Run typecheck, lint, and build.
7. Review routes and the final diff.

Do not invent an API shape, business rule, or visual design.

## UI source rule

The interface source is:

```text
C:\Projects\ecme-web-application-update-1.3.10\Theme\TypeScript\main
```

- UI must come from the source project; do not implement a visual pattern from scratch.
- This includes small behaviors such as collapse, sticky/fixed positioning,
  dropdown placement, scrolling, responsive transitions, and status styling.
  Never implement these with new local state, markup, or CSS when the source
  template contains an implementation.
- Opening and reading the exact source component is a required precondition to
  editing the corresponding UI. If no source implementation is found, stop and
  ask instead of creating one.
- Copy the matching source page markup and its complete dependency chain before
  adapting data. Reconstructing a source component from memory or appearance is
  prohibited.
- Preserve the source page's component boundaries, component names, and JSX
  composition. Do not replace source components with newly named equivalents,
  inline their markup into the page, or move authorization conditions into the
  copied page tree. Project-specific layout wrappers may only wrap the copied
  tree from outside.
- Do not approximate source colors, backgrounds, spacing, active/disabled
  states, overflow behavior, dropdown placement, or responsive classes.
- Before finishing a UI task, compare the adapted page against the source file
  component by component and verify that every intentional difference is
  required by API, state, routing, localization, or folder boundaries.
- A screen may combine multiple source components when no single complete example exists.
- Preserve the source appearance, spacing, responsive behavior, animation, and interaction.
- Adapt imports, data, API integration, state ownership, and folder placement to this project.
- Do not copy mock APIs, fake data infrastructure, authentication, routing, or stores from the source project.
- Reuse existing copied primitives before copying another equivalent.
- A dependency already used and installed by the source template may be installed without additional approval when the copied component requires it.
- Do not install a dependency that is absent from the source template without approval.

## Folder structure

- Route entry components live in `features/<feature>/pages`.
- Feature-specific components, hooks, API, schemas, stores, types, constants, and utilities stay inside the feature.
- Generic copied primitives live in `components/ui`.
- Reusable composed components live in `components/shared`.
- Route-level shells and their structural dependencies live in
  `components/layouts`; do not create parallel `template` or root `layouts`
  directories.
- Application, navigation, route, endpoint, and environment-backed
  configuration lives in `configs`, following the source template's
  `*.config.ts` and `<name>.config/index.ts` naming. Do not create a parallel
  singular `config` directory.
- Shared immutable values live in `constants` and follow the source template's
  `*.constant.ts` naming. Do not move constants into `configs` or create a
  parallel singular `constant` directory.
- Generic React hooks live in `hooks`; pure functions live in `utils`.
- Create only folders that contain real code.
- Feature internals are not imported directly by another feature; use public exports.

## Required libraries

- Use TanStack React Query for server state.
- Use Zustand for shared client state.
- Use local React state for small component-local state.
- Use Formik for form state and submission.
- Use Yup for form validation.
- Do not create a competing state, form, validation, or request architecture.

## API and authentication

- Use the shared `apiClient` for HTTP requests.
- Keep the versioned base URL in environment configuration.
- Authentication endpoints return the JWT in `data.accessToken`.
- The shared token-storage helper owns the persisted JWT; features do not access browser storage directly.
- The shared Axios client sends the JWT through `Authorization: Bearer <token>`.
- Check backend controllers and DTOs before defining frontend types.
- Unwrap the shared `{ message, data }` success envelope in feature API functions.
- Client-side route guards improve UX; backend authorization is authoritative.

## Error handling

- Use the shared error normalizer and actions.
- Field and form submission errors render inside the form.
- General mutation and operational errors render in a toast.
- Query failures that block page content render an inline error state with retry.
- Do not show the same error in multiple places.
- Keep parsing and classification out of page components whenever possible.
- An expired authenticated session produces no error toast; it clears auth state and query cache and redirects to `/sign-in`.

## Refactoring and scope

- Structural refactors preserve current behavior and UI.
- Report unrelated defects instead of silently expanding scope.
- Fix only defects that directly block the requested refactor unless the user approves more work.
- Preserve unrelated worktree changes.
- Do not create a commit unless explicitly requested.

## Documentation

## Text typography

- Never use the Unicode zero-width non-joiner character in source code,
  interface copy, validation messages, documentation, or data files.
- Use a regular space between all Persian word parts.

Documentation is written in English and describes only current code and current development rules. Do not add roadmaps, planned behavior, temporary Git state, or one-time validation output.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

The project currently has no automated UI test stack. Validate active routes manually after structural or interactive changes.
