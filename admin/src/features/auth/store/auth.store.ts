import { create } from 'zustand'
import { clearAccessToken } from '@/lib/http/access-token-storage'
import type { AuthLifecycleStatus, AuthPrincipal } from '../types/auth.types'

interface AuthState {
    principal: AuthPrincipal | null
    status: AuthLifecycleStatus
    setAuthenticated: (principal: AuthPrincipal) => void
    setAnonymous: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
    principal: null,
    status: 'bootstrapping',
    setAuthenticated: (principal) =>
        set({ principal, status: 'authenticated' }),
    setAnonymous: () => {
        clearAccessToken()
        set({ principal: null, status: 'anonymous' })
    },
}))
