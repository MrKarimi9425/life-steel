import { reportError } from './index'

let isRegistered = false

export function registerGlobalErrorHandlers() {
    if (isRegistered) return

    window.addEventListener('unhandledrejection', (event) => {
        reportError(event.reason)
    })

    isRegistered = true
}
