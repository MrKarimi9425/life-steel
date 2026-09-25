import { Navigate } from 'react-router'
import { AuthPageShell } from '../components/AuthPageShell'
import { PasswordSignInForm } from '../components/PasswordSignInForm'
import { useAuthStore } from '../store/auth.store'

export function PasswordSignInPage() {
    const status = useAuthStore((state) => state.status)
    if (status === 'authenticated') return <Navigate replace to="/" />

    return (
        <AuthPageShell
            description="شماره موبایل و رمز عبور حساب کاربری خود را وارد کنید."
            title="ورود به پنل لایف استیل"
        >
            <PasswordSignInForm />
        </AuthPageShell>
    )
}
