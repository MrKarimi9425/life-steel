import { FormikProvider, useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import * as Yup from 'yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { siteContentApi } from '../site-content.api'
import type {
    HomePageSettings,
    HomePageSettingsValues,
} from '../site-content.types'

export default function HomePageSettingsForm({
    settings,
    onSaved,
}: {
    settings: HomePageSettings
    onSaved: () => void
}) {
    const save = useMutation({
        mutationFn: siteContentApi.saveSettings,
        onSuccess: onSaved,
    })
    const form = useFormik<HomePageSettingsValues>({
        initialValues: {
            selectedProductsLimit: settings.selectedProductsLimit,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            selectedProductsLimit: Yup.number()
                .typeError('تعداد محصولات باید عدد باشد.')
                .integer('تعداد محصولات باید عدد صحیح باشد.')
                .min(1, 'حداقل یک محصول انتخاب کنید.')
                .max(8, 'حداکثر هشت محصول قابل نمایش است.')
                .required('تعداد محصولات الزامی است.'),
        }),
        onSubmit: (values) => save.mutate(values),
    })

    return (
        <FormikProvider value={form}>
            <Form onSubmit={form.handleSubmit}>
                <div className="max-w-xl space-y-5">
                    <FormItem
                        label="تعداد محصولات منتخب"
                        htmlFor="selectedProductsLimit"
                        invalid={Boolean(
                            form.touched.selectedProductsLimit &&
                            form.errors.selectedProductsLimit,
                        )}
                        errorMessage={form.errors.selectedProductsLimit}
                        extra="این تعداد از ابتدای فهرست مرتب شده محصولات در صفحه اصلی نمایش داده میشود."
                    >
                        <Input
                            id="selectedProductsLimit"
                            name="selectedProductsLimit"
                            type="number"
                            min={1}
                            max={8}
                            step={1}
                            inputMode="numeric"
                            value={form.values.selectedProductsLimit}
                            onBlur={form.handleBlur}
                            onChange={form.handleChange}
                        />
                    </FormItem>
                    <p className="text-sm leading-7 text-gray-500">
                        در دسکتاپ سه محصول همزمان دیده میشود. اگر تعداد بیشتر
                        باشد، ادامه محصولات با اسکرول افقی در دسترس است.
                    </p>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200 pt-5 dark:border-gray-700">
                    <Button
                        type="submit"
                        variant="solid"
                        loading={save.isPending}
                    >
                        ذخیره تنظیمات
                    </Button>
                </div>
            </Form>
        </FormikProvider>
    )
}
