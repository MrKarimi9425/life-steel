import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { registerGlobalErrorHandlers } from '@/lib/errors/register-global-error-handlers'
import '@/index.css'
import 'react-toastify/dist/ReactToastify.css'

registerGlobalErrorHandlers()

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('عنصر اصلی برنامه پیدا نشد.')
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
