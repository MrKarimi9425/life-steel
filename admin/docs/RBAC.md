# Administrator access

This project does not implement configurable roles, permission groups, membership
requests or customer accounts. The filename is retained for existing documentation
links; it describes the current owner/administrator boundary, not an RBAC feature.

## Owner and administrators

All authenticated, active administrators who have completed required password
changes can manage catalog, blog, languages and site content.

Only the owner can list/create administrators, change their status and issue
temporary replacement passwords. The panel route `/admins` uses `OwnerRoute`;
the backend administrators controller uses `AccessTokenGuard` and `OwnerGuard`.

The backend principal exposes `role` as OWNER or ADMIN, `isOwner`, and an
owner authority marker in `permissions` for compatibility with the copied
navigation components. These are not an editable permission catalog.

Client-side visibility does not grant access. Backend authentication verifies
the session, administrator status and pending password-change restriction before
protected operations.
