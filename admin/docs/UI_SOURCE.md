# UI Source Policy

## Source project

All visual implementation is sourced from:

```text
<!-- C:\Projects\ecme-web-application-update-1.3.10\Theme\TypeScript\main -->
C:\Users\User\Downloads\ecme-web-application-update-1.3.10\Theme\TypeScript\main
```

The source project is the authority for component appearance, spacing, responsive behavior, animation, and interaction.

## Copy workflow

1. Find the matching source page or component.
2. Identify the primitive components, assets, styles, and dependencies it uses.
3. Reuse an existing copied primitive when the admin already contains the same source component.
4. Copy only the required source implementation.
5. Place it according to the admin folder boundaries.
6. Replace source mock data and services with the admin feature's API and state layers.
7. Preserve the source DOM, class names, accessibility behavior, and responsive logic unless integration requires a minimal adaptation.
8. Compare the final implementation with the source markup, component props,
   and styles before validation.
9. Remove any earlier custom substitute after the source implementation is
   introduced; do not leave competing UI paths.

## Non-negotiable fidelity

Source-template code is copied first and adapted second. Rebuilding a matching
component from memory, from a screenshot, or from visual approximation is not
an acceptable implementation.

This rule applies to every visual behavior, including small interactions such
as menu collapse, sticky positioning, dropdown alignment, loading states, and
responsive transitions. A behavior being simple does not permit writing a
local substitute.

Before editing UI code, the matching source file must be opened and its
dependency chain inspected. If the template already implements the requested
behavior, that implementation and its primitives must be copied. If no matching
implementation can be found, work stops for clarification; a new visual
implementation is not created by default.

Examples:

- collapsible navigation uses the template `Menu`, `MenuCollapse`, and vertical
  navigation composition
- fixed or sticky panels use the template `Affix` or sticky-bar implementation
- dialogs, dropdowns, tables, and form sections retain the template component
  tree rather than replacing it with feature-local markup

Replacing a source primitive with custom React state, custom animation, custom
CSS, or a visually similar component is a policy violation even when the final
screenshot appears close.

The source component tree is also part of the UI contract. Component names,
boundaries, ordering, and page-level JSX composition are preserved. API,
React Query, Formik, and RBAC logic belongs inside the corresponding copied
component or in its hook; it must not replace or reshape the source page tree.

The following details must remain identical to the source unless a documented
integration constraint requires otherwise:

- background and semantic colors
- horizontal and vertical spacing
- active, disabled, hover, and focus states
- modal dimensions and scrolling boundaries
- dropdown placement and alignment
- responsive class names and breakpoints
- component composition and interaction behavior

API calls, mock-data replacement, Formik integration, React Query state,
permission checks, localization text, and project folder placement may be
adapted. These adaptations must not change the source interface.

If no complete source screen exists, multiple source components may be composed. The composition must still look and behave like the source project; a new visual pattern is not introduced.

## Placement

- generic source primitives: `src/components/ui`
- reusable composed elements: `src/components/shared`
- route shells: `src/components/layouts`
- feature-specific source views: `src/features/<feature>/components`
- imported assets: `src/assets` or `public` according to how the source references them

## Excluded source code

Do not copy the source project's:

- mock adapter and fake API
- fake data
- authentication implementation
- routing configuration
- application stores
- unrelated dependencies

A dependency used by the copied source component may be installed when it already exists in the source project's `package.json`.

## Current visual system

The admin currently uses the source project's Kook font, Tailwind-based theme, stacked dashboard navigation, Dialog, Drawer, Dropdown, Menu, Form, Input, Button, Card, Avatar, ScrollBar, and Spinner patterns.
