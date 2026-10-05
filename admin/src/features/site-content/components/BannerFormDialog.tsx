import { useMemo, useState } from 'react'
import { FormikProvider, useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { LanguageTabs } from '@/features/catalog'
import { useContentLanguages, TranslatedTextField } from '@/features/blog'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import { Form } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi } from '../site-content.api'
import type { BannerValues, SiteBanner } from '../site-content.types'

function validTarget(value: string) {
    if (value.startsWith('/') && !value.startsWith('//') && !/\s/.test(value))
        return true
    try {
        const url = new URL(value)
        return (
            ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname)
        )
    } catch {
        return false
    }
}

export default function BannerFormDialog({
    item,
    sectionId,
    onClose,
    onSaved,
}: {
    item: SiteBanner | null
    sectionId: string
    onClose: () => void
    onSaved: () => void
}) {
    const { query, languages, persianId } = useContentLanguages()
    const [active, setActive] = useState<string | null>(null)
    const activeId = active ?? persianId ?? languages[0]?.id ?? ''
    const initialValues = useMemo<BannerValues>(
        () => ({
            sectionId: item?.sectionId ?? sectionId,
            isPublished: item?.isPublished ?? false,
            translations: languages.map((language) => {
                const translation = item?.translations.find(
                    (row) => row.languageId === language.id,
                )
                return {
                    languageId: language.id,
                    altText: translation?.altText ?? '',
                    targetUrl: translation?.targetUrl ?? '',
                }
            }),
        }),
        [item, languages, sectionId],
    )
    const save = useMutation({
        mutationFn: (values: BannerValues) =>
            siteContentApi.saveBanner(item?.id ?? null, {
                ...values,
                translations: values.translations
                    .filter((row) => row.altText.trim() || row.targetUrl.trim())
                    .map((row) => ({
                        ...row,
                        altText: row.altText.trim(),
                        targetUrl: row.targetUrl.trim(),
                    })),
            }),
        onSuccess: () => {
            onSaved()
            onClose()
        },
    })
    const form = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            translations: Yup.array().of(
                Yup.object({
                    languageId: Yup.string(),
                    altText: Yup.string()
                        .max(255, 'متن جایگزین باید حداکثر ۲۵۵ کاراکتر باشد.')
                        .test(
                            'required',
                            'متن جایگزین تصویر را وارد کنید.',
                            function (value) {
                                return (
                                    (this.parent.languageId !== persianId &&
                                        !this.parent.targetUrl) ||
                                    Boolean(value?.trim())
                                )
                            },
                        ),
                    targetUrl: Yup.string()
                        .max(2048, 'لینک باید حداکثر ۲۰۴۸ کاراکتر باشد.')
                        .test(
                            'valid-url',
                            'مسیر داخلی باید با / شروع شود یا نشانی کامل http/https باشد.',
                            (value) => !value || validTarget(value.trim()),
                        ),
                }),
            ),
        }),
        onSubmit: (values) => save.mutate(values),
    })
    const index = form.values.translations.findIndex(
        (row) => row.languageId === activeId,
    )
    const direction =
        languages.find((language) => language.id === activeId)?.direction ===
        'LTR'
            ? 'ltr'
            : 'rtl'
    const canPublish = Boolean(
        item &&
        form.values.translations
            .filter((row) => row.altText.trim() || row.targetUrl.trim())
            .every((row) => {
                const saved = item.translations.find(
                    (translation) => translation.languageId === row.languageId,
                )
                return Boolean(
                    saved?.desktopImageId &&
                    saved.tabletImageId &&
                    saved.mobileImageId,
                )
            }),
    )
    return (
        <FormDialog
            isOpen
            title={item ? 'ویرایش بنر' : 'افزودن بنر'}
            width={720}
            isPending={save.isPending}
            onClose={onClose}
        >
            <FormikProvider value={form}>
                <Form
                    onSubmit={(event) => {
                        event.preventDefault()
                        if (save.isPending || query.isPending || query.isError)
                            return
                        void form.validateForm().then((errors) => {
                            if (Object.keys(errors).length) {
                                toast.error('فیلدهای مشخص شده را اصلاح کنید.')
                                if (Array.isArray(errors.translations))
                                    setActive(
                                        form.values.translations[
                                            errors.translations.findIndex(
                                                Boolean,
                                            )
                                        ]?.languageId ?? null,
                                    )
                            }
                            void form.submitForm()
                        })
                    }}
                >
                    <FormDialogBody className="space-y-5">
                        {query.isPending ? (
                            <Loading loading />
                        ) : query.isError ? (
                            <QueryErrorState
                                error={query.error}
                                title="دریافت زبان ها ناموفق بود."
                                onRetry={() => void query.refetch()}
                            />
                        ) : (
                            <>
                                <LanguageTabs
                                    languages={languages}
                                    activeId={activeId}
                                    onChange={setActive}
                                >
                                    {index >= 0 && (
                                        <div className="space-y-4">
                                            <TranslatedTextField
                                                name={`translations.${index}.altText`}
                                                label="متن جایگزین تصویر"
                                                required={
                                                    activeId === persianId
                                                }
                                                direction={direction}
                                            />
                                            <TranslatedTextField
                                                name={`translations.${index}.targetUrl`}
                                                label="لینک بنر"
                                                direction="ltr"
                                            />
                                            <p className="text-sm text-gray-500">
                                                مسیر داخلی مانند /products یا
                                                نشانی کامل سایت دیگر را وارد
                                                کنید. در صورت خالی بودن، بنر
                                                بدون لینک نمایش داده می شود.
                                            </p>
                                        </div>
                                    )}
                                </LanguageTabs>
                                <div className="space-y-2">
                                    <Checkbox
                                        checked={form.values.isPublished}
                                        disabled={
                                            !canPublish &&
                                            !form.values.isPublished
                                        }
                                        onChange={(checked) =>
                                            void form.setFieldValue(
                                                'isPublished',
                                                checked,
                                            )
                                        }
                                    >
                                        انتشار در سایت
                                    </Checkbox>
                                    {!canPublish && (
                                        <p className="text-sm text-gray-500">
                                            پس از ذخیره، هر سه تصویر زبان های
                                            ثبت شده را از اکشن جدول بارگذاری
                                            کنید. سپس امکان انتشار فعال می شود.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button
                            type="button"
                            disabled={save.isPending}
                            onClick={onClose}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={save.isPending}
                            disabled={query.isPending || query.isError}
                        >
                            ذخیره بنر
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormikProvider>
        </FormDialog>
    )
}
