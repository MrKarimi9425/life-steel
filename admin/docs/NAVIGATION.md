# Dashboard Navigation

## Layout

The desktop dashboard uses the source template's `LAYOUT_COLLAPSIBLE_SIDE` layout. The sidebar is 290 pixels wide when expanded and 80 pixels wide when collapsed. The header menu button switches between these states. The collapsed state displays only item icons; the expanded state displays navigation group and item labels. On smaller screens, the same navigation content is rendered inside a right-side drawer.

The active layout uses the copied source-template chain:

- `components/layouts/PostLoginLayout/components/CollapsibleSide.tsx` composes the sidebar, header, and mobile navigation.
- `components/layouts/components/SideNav.tsx` renders the desktop sidebar.
- `components/layouts/components/MobileNav.tsx` renders the mobile drawer.
- `components/layouts/components/SideNavToggle.tsx` controls the shared collapsed state.
- `components/layouts/components/VerticalMenuContent` renders the menu tree.
- `configs/navigation.config/index.ts` defines labels, routes, permissions, and icons.
- `store/themeStore.ts` owns the collapsed state shared by the copied components.

## SVG icons

Sidebar SVG files live in `public/img/icons/sidebar`. Navigation entries reference a file with an icon source object:

```ts
{
    key: 'users',
    title: 'Users',
    path: '/users',
    icon: '/img/icons/sidebar/users.svg',
    type: 'item',
}
```

The SVG is rendered as a CSS mask so it inherits the menu item's current color, including active and hover states. Monochrome SVG artwork is therefore the preferred format. The SVG must include a `viewBox` and should not depend on embedded raster images.

To replace an existing icon without changing code, overwrite the corresponding file while keeping its filename. To add a new icon, place the SVG in the same directory and reference its public path in `configs/navigation.config/index.ts`.

The account category contains the profile route:

- `/personal-information` for the profile form, guarded by `Profile:view`

Password setup and change are opened as a modal from the account dropdown and
do not have a dedicated route.

The account category is collapsible while the full sidebar is open. When the
sidebar itself is collapsed, child icons remain directly accessible.

The management category is also collapsible and contains the permission-filtered
user, membership-request, and role-management routes. `/access-requests` requires
`AccessRequest:view`; its menu item displays the server-provided pending count.

The dashboard shell keeps the header and sidebar outside the scrolling region.
Only the content area below the header scrolls. Every dashboard route uses the
same contained width and responsive page gutter.

The dashboard item currently uses `test.svg` as a visible integration example. It can be overwritten with another monochrome SVG or changed to another file path.

The inline `DashboardIconName` values remain available for header controls and for navigation entries that do not use an external SVG file.
