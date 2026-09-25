import { useFormik } from 'formik'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { getFormikErrors, normalizeError, reportError } from '@/lib/errors'
import { queryClient } from '@/lib/query/query-client'
import { useApiMutation } from '@/lib/query/use-api-mutation'
import {
    authQueryKeys,
    getCurrentPrincipal,
    signInWithPassword,
} from '../api/auth.api'
import { passwordSignInSchema } from '../schemas/password-sign-in.schema'
import { useAuthStore } from '../store/auth.store'
import type {
    PasswordSignInFormValues,
    PasswordSignInPayload,
} from '../types/auth.types'
import { toBackendPhoneNumber } from '../utils/phone-number'
import { PasswordField } from './PasswordField'
import { PhoneNumberField } from './PhoneNumberField'

const initialValues: PasswordSignInFormValues = {
    password: '',
    phoneNumber: '',
}

export function PasswordSignInForm() {
    const navigate = useNavigate()
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
    const passwordSignInMutation = useApiMutation({
        mutationFn: signInWithPassword,
        notifyOnError: false,
        meta: {
            suppressGlobalSuccess: true,
            suppressGlobalError: true,
        },
    })
    const formik = useFormik({
        initialValues,
        validationSchema: passwordSignInSchema,
        onSubmit: async (values, helpers) => {
            const payload: PasswordSignInPayload = {
                phoneNumber: toBackendPhoneNumber(values.phoneNumber),
                password: values.password,
            }

            try {
                const response =
                    await passwordSignInMutation.mutateAsync(payload)
                const principal = await queryClient.fetchQuery({
                    queryKey: authQueryKeys.currentPrincipal,
                    queryFn: getCurrentPrincipal,
                    meta: { suppressGlobalError: true },
                    staleTime: 0,
                })

                setAuthenticated(principal)
                toast.success(response.message, {
                    toastId: 'password-sign-in-success',
                })
                navigate(
                    principal.mustChangePassword ? '/change-password' : '/',
                    {
                        replace: true,
                    },
                )
            } catch (error) {
                const appError = normalizeError(error)
                const formErrors =
                    getFormikErrors<PasswordSignInFormValues>(appError)

                if (Object.keys(formErrors).length > 0) {
                    helpers.setErrors(formErrors)
                } else {
                    reportError(appError)
                }
            }
        },
    })

    return (
        <Form noValidate onSubmit={formik.handleSubmit}>
            <PhoneNumberField
                error={formik.errors.phoneNumber}
                showError={Boolean(formik.touched.phoneNumber)}
                value={formik.values.phoneNumber}
                onBlur={formik.handleBlur}
                onChange={(value) =>
                    void formik.setFieldValue('phoneNumber', value)
                }
            />
            <PasswordField
                error={formik.errors.password}
                showError={Boolean(formik.touched.password)}
                value={formik.values.password}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
            />
            <Button
                block
                className="mt-7"
                loading={passwordSignInMutation.isPending}
                type="submit"
                variant="solid"
            >
                ورود با رمز عبور
            </Button>
        </Form>
    )
}
