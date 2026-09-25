import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { queryClient } from '@/lib/query/query-client'
import { subscribeToAuthenticationFailure } from '@/lib/http/authentication-failure'
import { useAuthStore } from '../store/auth.store'

export function AuthSessionSynchronizer() {
    const navigate = useNavigate()

    useEffect(
        () =>
            subscribeToAuthenticationFailure(() => {
                const authState = useAuthStore.getState()

                if (authState.status !== 'authenticated') return

                authState.setAnonymous()
                queryClient.clear()
                navigate('/sign-in', { replace: true })
            }),
        [navigate],
    )

    return null
}
