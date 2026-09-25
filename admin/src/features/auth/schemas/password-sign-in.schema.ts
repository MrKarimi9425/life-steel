import * as yup from 'yup'
import { normalizePhoneNumberInput } from '../utils/phone-number'

const iranianPhoneNumberSchema = yup
    .string()
    .transform((value) =>
        typeof value === 'string' ? normalizePhoneNumberInput(value) : value,
    )
    .required('لطفا شماره موبایل خود را وارد کنید.')
    .matches(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.')

export const passwordSignInSchema = yup.object({
    phoneNumber: iranianPhoneNumberSchema,
    password: yup
        .string()
        .required('لطفاً رمز عبور خود را وارد کنید.')
        .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.')
        .max(128, 'رمز عبور باید حداکثر ۱۲۸ کاراکتر باشد.'),
})
