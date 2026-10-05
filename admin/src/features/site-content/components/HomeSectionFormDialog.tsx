import { FormikProvider, useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import * as Yup from 'yup'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Form, FormItem } from '@/components/ui/Form'
import { siteContentApi } from '../site-content.api'
import type { HomeSection, HomeSectionValues } from '../site-content.types'

const layoutOptions: Array<{
    value: HomeSectionValues['type']
    label: string
}> = [
    { value: 'BANNER_FULL', label: 'یک بنر تمام عرض' },
    { value: 'BANNER_SPLIT', label: 'دو بنر کنار هم' },
]

export default function HomeSectionFormDialog({
    item,
    onClose,
    onSaved,
}: {
    item: HomeSection | null
    onClose: () => void
    onSaved: () => void
}) {
    const save = useMutation({
        mutationFn: (values: HomeSectionValues) =>
            siteContentApi.saveSection(item?.id ?? null, values),
        onSuccess: () => {
            onSaved()
            onClose()
        },
    })
    const form = useFormik<HomeSectionValues>({
        initialValues: {
            type:
                item?.type === 'BANNER_SPLIT' ? 'BANNER_SPLIT' : 'BANNER_FULL',
            title: item?.title ?? '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            type: Yup.string()
                .oneOf(['BANNER_FULL', 'BANNER_SPLIT'])
                .required(),
            title: Yup.string()
                .trim()
                .max(150, 'عنوان باید حداکثر ۱۵۰ کاراکتر باشد.')
                .required('عنوان مدیریتی را وارد کنید.'),
        }),
        onSubmit: (values) =>
            save.mutate({ ...values, title: values.title.trim() }),
    })
    return (
        <FormDialog
            isOpen
            title={item ? 'ویرایش بخش بنر' : 'افزودن بخش بنر'}
            width={560}
            isPending={save.isPending}
            onClose={onClose}
        >
            <FormikProvider value={form}>
                <Form onSubmit={form.handleSubmit}>
                    <FormDialogBody className="space-y-5">
                        <FormItem
                            label="عنوان مدیریتی"
                            htmlFor="home-section-title"
                            invalid={Boolean(
                                form.touched.title && form.errors.title,
                            )}
                            errorMessage={form.errors.title}
                            extra="این عنوان فقط داخل پنل نمایش داده می شود."
                        >
                            <Input
                                id="home-section-title"
                                name="title"
                                value={form.values.title}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                            />
                        </FormItem>
                        <FormItem
                            label="نوع چیدمان"
                            extra="در موبایل، دو بنر به صورت زیر هم نمایش داده می شوند."
                        >
                            <Select
                                options={layoutOptions}
                                value={layoutOptions.find(
                                    (option) =>
                                        option.value === form.values.type,
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
                        >
                            ذخیره بخش
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormikProvider>
        </FormDialog>
    )
}
