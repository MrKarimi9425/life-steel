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
import { Form, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi } from '../site-content.api'
import {
    contactTypes,
    type ContactInformation,
    type ContactValues,
} from '../site-content.types'
export default function ContactFormDialog({
    item,
    onClose,
    onSaved,
}: {
    item: ContactInformation | null
    onClose: () => void
    onSaved: () => void
}) {
    const { query, languages, persianId } = useContentLanguages()
    const [active, setActive] = useState<string | null>(null)
    const activeId = active ?? persianId ?? languages[0]?.id ?? ''
    const initialValues = useMemo<ContactValues>(
        () => ({
            type: item?.type ?? 'PHONE',
            isActive: item?.isActive ?? true,
            translations: languages.map((l) => ({
                languageId: l.id,
                title:
                    item?.translations.find((t) => t.languageId === l.id)
                        ?.title ?? '',
                value:
                    item?.translations.find((t) => t.languageId === l.id)
                        ?.value ?? '',
            })),
        }),
        [item, languages],
    )
    const save = useMutation({
        mutationFn: (values: ContactValues) =>
            siteContentApi.saveContact(item?.id ?? null, values),
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
                    title: Yup.string()
                        .max(150, 'عنوان باید حداکثر ۱۵۰ کاراکتر باشد.')
                        .test(
                            'required',
                            'عنوان را وارد کنید.',
                            function (value) {
                                return (
                                    (this.parent.languageId !== persianId &&
                                        !this.parent.value) ||
                                    Boolean(value?.trim())
                                )
                            },
                        ),
                    value: Yup.string()
                        .max(2000, 'مقدار باید حداکثر ۲۰۰۰ کاراکتر باشد.')
                        .test(
                            'required',
                            'مقدار را وارد کنید.',
                            function (value) {
                                return (
                                    (this.parent.languageId !== persianId &&
                                        !this.parent.title) ||
                                    Boolean(value?.trim())
                                )
                            },
                        ),
                }),
            ),
        }),
        onSubmit: (values) => save.mutate(values),
    })
    const index = form.values.translations.findIndex(
        (t) => t.languageId === activeId,
    )
    const direction =
        languages.find((l) => l.id === activeId)?.direction === 'LTR'
            ? 'ltr'
            : 'rtl'
    return (
        <FormDialog
            isOpen
            title={item ? 'ویرایش راه ارتباطی' : 'افزودن راه ارتباطی'}
            width={680}
            isPending={save.isPending}
            onClose={onClose}
        >
            <FormikProvider value={form}>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
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
                                <FormItem label="نوع">
                                    <Select
                                        options={contactTypes}
                                        value={contactTypes.find(
                                            (t) => t.value === form.values.type,
                                        )}
                                        onChange={(option) => {
                                            if (option)
                                                void form.setFieldValue(
                                                    'type',
                                                    option.value,
                                                )
                                        }}
                                    />
                                </FormItem>
                                <LanguageTabs
                                    languages={languages}
                                    activeId={activeId}
                                    onChange={setActive}
                                >
                                    {index >= 0 && (
                                        <div className="space-y-4">
                                            <TranslatedTextField
                                                name={`translations.${index}.title`}
                                                label="عنوان نمایشی"
                                                required={
                                                    activeId === persianId
                                                }
                                                direction={direction}
                                            />
                                            <TranslatedTextField
                                                name={`translations.${index}.value`}
                                                label={
                                                    contactTypes.find(
                                                        (t) =>
                                                            t.value ===
                                                            form.values.type,
                                                    )?.label ?? 'مقدار'
                                                }
                                                required={
                                                    activeId === persianId
                                                }
                                                multiline={
                                                    form.values.type ===
                                                        'ADDRESS' ||
                                                    form.values.type === 'HOURS'
                                                }
                                                direction={
                                                    [
                                                        'PHONE',
                                                        'EMAIL',
                                                        'LINK',
                                                    ].includes(form.values.type)
                                                        ? 'ltr'
                                                        : direction
                                                }
                                            />
                                        </div>
                                    )}
                                </LanguageTabs>
                                <Checkbox
                                    checked={form.values.isActive}
                                    onChange={(checked) =>
                                        void form.setFieldValue(
                                            'isActive',
                                            checked,
                                        )
                                    }
                                >
                                    نمایش در سایت
                                </Checkbox>
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
                            ذخیره
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormikProvider>
        </FormDialog>
    )
}
