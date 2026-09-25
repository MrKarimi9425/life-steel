type AuthenticationFailureListener = () => void

const listeners = new Set<AuthenticationFailureListener>()

export function notifyAuthenticationFailure() {
    listeners.forEach((listener) => listener())
}

export function subscribeToAuthenticationFailure(
    listener: AuthenticationFailureListener,
) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}
