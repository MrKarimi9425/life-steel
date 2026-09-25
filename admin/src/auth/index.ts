import { useAuthStore } from '@/features/auth'

export const useAuth = () => {
    const status = useAuthStore((state) => state.status)

    return { authenticated: status === 'authenticated' }
}
