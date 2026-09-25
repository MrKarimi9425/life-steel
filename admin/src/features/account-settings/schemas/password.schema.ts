import * as yup from 'yup'

const passwordSchema = yup
    .string()
    .required('لطفاً رمز عبور را وارد کنید.')
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.')
    .max(128, 'رمز عبور باید حداکثر ۱۲۸ کاراکتر باشد.')

export const changePasswordSchema = yup.object({
    currentPassword: passwordSchema.required(
        'لطفاً رمز عبور فعلی خود را وارد کنید.',
    ),
    newPassword: passwordSchema
        .required('لطفاً رمز عبور جدید خود را وارد کنید.')
        .notOneOf(
            [yup.ref('currentPassword')],
            'رمز عبور جدید باید متفاوت باشد.',
        ),
    confirmPassword: passwordSchema
        .required('لطفاً رمز عبور جدید را تأیید کنید.')
        .oneOf([yup.ref('newPassword')], 'رمزهای عبور مطابقت ندارند.'),
})
