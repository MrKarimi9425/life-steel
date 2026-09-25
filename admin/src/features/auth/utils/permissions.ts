import type { AuthPrincipal } from '../types/auth.types'

export function hasPermission(
    principal: AuthPrincipal | null,
    permission: string,
): boolean {
    return principal?.permissions.includes(permission) ?? false
}
