import type { ErrorKind } from '@/lib/errors/AppError'

export function statusToKind(statusCode: number): ErrorKind {
    if (statusCode === 401) return 'authentication'
    if (statusCode === 403) return 'authorization'
    if (statusCode === 404) return 'not-found'
    if (statusCode === 422) return 'validation'
    if (statusCode >= 500) return 'server'
    return 'client'
}

export function getStatusMessage(statusCode: number) {
    const messages: Record<number, string> = {
        400: 'درخواست ارسال شده معتبر نیست.',
        401: 'نشست شما معتبر نیست. دوباره وارد شوید.',
        403: 'اجازه انجام این عملیات را ندارید.',
        404: 'اطلاعات درخواستی پیدا نشد.',
        409: 'اطلاعات ارسالی با وضعیت فعلی تداخل دارد.',
        422: 'اطلاعات فرم را بررسی کنید.',
        429: 'تعداد درخواست ها زیاد است. کمی بعد دوباره تلاش کنید.',
    }

    return statusCode >= 500
        ? 'خطایی در سرور رخ داد. کمی بعد دوباره تلاش کنید.'
        : (messages[statusCode] ?? 'انجام درخواست با خطا مواجه شد.')
}
