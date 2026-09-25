import { useNavigate } from 'react-router'
import { AuthPageShell } from '@/features/auth/components/AuthPageShell'
import SettingsSecurity from '../components/SettingsSecurity'

export function RequiredPasswordChangePage() {
    const navigate = useNavigate()

    return (
        <AuthPageShell
            title="تغییر رمز موقت"
            description="برای ادامه کار، رمز موقت را با یک رمز شخصی و امن جایگزین کنید."
        >
            <SettingsSecurity onSuccess={() => navigate('/', { replace: true })} />
        </AuthPageShell>
    )
}
