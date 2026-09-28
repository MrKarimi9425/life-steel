# Dashboard navigation

## Layout

The panel remains Persian and RTL. Content-language selection changes only the
direction of translated fields and editors, using the language's direction
setting; it does not flip navigation or the surrounding form.

The copied `LAYOUT_COLLAPSIBLE_SIDE` chain uses an expanded/collapsed desktop
sidebar and a mobile drawer:

- `components/layouts/PostLoginLayout/components/CollapsibleSide.tsx`
- `components/layouts/components/SideNav.tsx`, `MobileNav.tsx`,
  `SideNavToggle.tsx` and `VerticalMenuContent`
- `store/themeStore.ts`
- `configs/navigation.config/index.ts`

The header and sidebar remain outside the content scroll area.
`ListPageLayout` allows desktop list scrolling; on mobile the page heading,
filters, cards and pagination scroll together.

## Active routes

| Group | Routes |
| --- | --- |
| Dashboard | `/` |
| Catalog | `/products`, `/product-categories`, `/product-attributes` |
| Blog | `/blog/articles`, `/blog/categories`, `/blog/tags` |
| Site content | `/site/about`, `/site/contacts`, `/site/messages` |
| Settings | `/languages`, `/interface-phrases`, `/admins` |

The administrators route and navigation item are owner-only. There are no
profile, media-library, membership-request or role-management routes.
The account dropdown opens password change; required password change has its
own protected `/change-password` route.

## Icons and composition

The active configuration imports Iconsax SVG components with SVGR's `?react`
suffix and stores components in navigation entries. Reuse the existing icon
and layout system rather than adding a runtime icon registry or reconstructing
the sidebar. Page actions use a wrapping flex group with an explicit gap.
