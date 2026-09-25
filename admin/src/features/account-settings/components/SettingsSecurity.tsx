import { useFormik } from 'formik'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import {
    authQueryKeys,
    changePassword,
    getCurrentPrincipal,
    useAuthStore,
} from '@/features/auth'
import { getFormSubmissionErrors, normalizeError, reportError } from '@/lib/errors'
import { useApiMutation } from '@/lib/query/use-api-mutation'
import { changePasswordSchema } from '../schemas/password.schema'
import type { ChangePasswordFormValues } from '@/features/auth'

interface SettingsSecurityProps {
    onSuccess?: () => void
}

const initialValues: ChangePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
}

const SettingsSecurity = ({ onSuccess }: SettingsSecurityProps) => {
    const queryClient = useQueryClient()
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
    const mutation = useApiMutation({
        mutationFn: changePassword,
        notifyOnError: false,
        meta: {
            suppressGlobalSuccess: true,
            suppressGlobalError: true,
        },
    })
    const formik = useFormik<ChangePasswordFormValues>({
        initialValues,
        validationSchema: changePasswordSchema,
        validateOnMount: true,
        onSubmit: async (values, helpers) => {
            helpers.setStatus(undefined)
            try {
                const response = await mutation.mutateAsync({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                })
                await queryClient.invalidateQueries({ queryKey: authQueryKeys.currentPrincipal })
                const principal = await queryClient.fetchQuery({
                    queryKey: authQueryKeys.currentPrincipal,
                    queryFn: getCurrentPrincipal,
                    staleTime: 0,
                })
                setAuthenticated(principal)
                helpers.resetForm()
                toast.success(response.message)
                onSuccess?.()
            } catch (error) {
                const normalized = normalizeError(error)
                const submission = getFormSubmissionErrors<ChangePasswordFormValues>(normalized)
                if (submission) {
                    helpers.setErrors(submission.fieldErrors)
                    helpers.setStatus(submission.formError)
                } else {
                    reportError(normalized)
                }
            }
        },
    })

    return (
        <Form noValidate onSubmit={formik.handleSubmit}>
            <FormItem
                label="رمز عبور فعلی"
                invalid={Boolean(formik.touched.currentPassword && formik.errors.currentPassword)}
                errorMessage={formik.errors.currentPassword}
            >
                <Input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={formik.values.currentPassword}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                />
            </FormItem>
            <FormItem
                label="رمز عبور جدید"
                invalid={Boolean(formik.touched.newPassword && formik.errors.newPassword)}
                errorMessage={formik.errors.newPassword}
            >
                <Input
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formik.values.newPassword}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                />
            </FormItem>
            <FormItem
                label="تکرار رمز عبور جدید"
                invalid={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                errorMessage={formik.errors.confirmPassword}
            >
                <Input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formik.values.confirmPassword}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                />
            </FormItem>
            {typeof formik.status === 'string' && (
                <p className="mb-4 font-semibold text-error">{formik.status}</p>
            )}
            <Button
                block
                disabled={!formik.isValid || !formik.dirty}
                loading={mutation.isPending}
                type="submit"
                variant="solid"
            >
                تغییر رمز عبور
            </Button>
        </Form>
    )
}

export default SettingsSecurity
