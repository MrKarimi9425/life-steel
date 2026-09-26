import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FormDialog, {
    FormDialogBody,
    FormDialogActions,
} from '@/components/shared/FormDialog'
import MoneyInput from '@/components/shared/MoneyInput'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import { productsApi } from '../products.api'
import type { ProductPricingForm } from '../products.types'
import ProductColorImagesField from './ProductColorImagesField'

const amount = Yup.string().test(
    'amount',
    'قیمت باید عدد صحیح مثبت باشد.',
    (value) => !value || /^[1-9][0-9]{0,14}$/.test(value),
)
const schema = Yup.object({
    showPrice: Yup.boolean().required(),
    basePrice: amount,
    colors: Yup.array().of(
        Yup.object({ optionId: Yup.string().required(), amount }),
    ),
})
type Props = {
    productId: string
    languageId?: string
    onClose: () => void
    onSaved: () => void
}

export default function ProductPricingDialog({
    productId,
    languageId,
    onClose,
    onSaved,
}: Props) {
    const query = useQuery({
        queryKey: ['catalog', 'pricing', productId],
        queryFn: () => productsApi.pricing(productId),
    })
    const save = useMutation({
        mutationFn: (values: ProductPricingForm) =>
            productsApi.savePricing(productId, values),
        onSuccess: () => {
            onSaved()
            onClose()
        },
    })
    const form = useFormik<ProductPricingForm>({
        initialValues: {
            showPrice: query.data?.showPrice ?? false,
            basePrice: query.data?.basePrice ?? '',
            colors:
                query.data?.colors.map((color) => ({
                    optionId: color.id,
                    amount: color.amount ?? '',
                    mediaIds: color.mediaIds,
                    primaryMediaId: color.primaryMediaId,
                })) ?? [],
        },
        enableReinitialize: true,
        validationSchema: schema,
        onSubmit: async (values) => {
            await save.mutateAsync(values).catch(() => undefined)
        },
    })
    return (
        <FormDialog
            isOpen
            title="قیمت گذاری محصول"
            width={700}
            isPending={save.isPending}
            onClose={onClose}
        >
            <Form noValidate onSubmit={form.handleSubmit}>
                <FormDialogBody className="space-y-5">
                    {query.isPending ? (
                        <Loading loading className="min-h-40" />
                    ) : query.isError ? (
                        <QueryErrorState
                            title="دریافت قیمت گذاری با خطا مواجه شد."
                            error={query.error}
                            onRetry={() => void query.refetch()}
                        />
                    ) : (
                        <>
                            <Checkbox
                                checked={form.values.showPrice}
                                onChange={(showPrice) =>
                                    void form.setFieldValue(
                                        'showPrice',
                                        showPrice,
                                    )
                                }
                            >
                                نمایش قیمت در سایت
                            </Checkbox>
                            <p className="text-sm text-gray-500">
                                وقتی نمایش قیمت خاموش باشد، «تماس بگیرید» نمایش
                                داده میشود. قیمت های ثبت شده حفظ میشوند و به
                                سایت ارسال نمیشوند.
                            </p>
                            {!form.values.colors.length ? (
                                <FormItem
                                    label="قیمت پایه"
                                    invalid={Boolean(
                                        form.touched.basePrice &&
                                        form.errors.basePrice,
                                    )}
                                    errorMessage={form.errors.basePrice}
                                >
                                    <MoneyInput
                                        value={form.values.basePrice}
                                        onValueChange={(value) =>
                                            void form.setFieldValue(
                                                'basePrice',
                                                value,
                                            )
                                        }
                                        onBlur={() =>
                                            void form.setFieldTouched(
                                                'basePrice',
                                            )
                                        }
                                        placeholder="بدون قیمت: تماس بگیرید"
                                    />
                                </FormItem>
                            ) : (
                                <div
                                    className={`grid gap-x-4 ${form.values.colors.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
                                >
                                    {query.data?.colors.map((color, index) => {
                                        const error =
                                            form.errors.colors?.[index]
                                        const message =
                                            typeof error === 'object'
                                                ? error.amount
                                                : undefined
                                        const label =
                                            color.translations.find(
                                                (item) =>
                                                    item.languageId ===
                                                    languageId,
                                            )?.label ??
                                            color.translations[0]?.label ??
                                            'رنگ محصول'
                                        return (
                                            <FormItem
                                                key={color.id}
                                                label={label}
                                                invalid={Boolean(
                                                    form.touched.colors?.[index]
                                                        ?.amount && message,
                                                )}
                                                errorMessage={message}
                                            >
                                                <MoneyInput
                                                    value={
                                                        form.values.colors[
                                                            index
                                                        ]?.amount
                                                    }
                                                    onValueChange={(value) =>
                                                        void form.setFieldValue(
                                                            `colors.${index}.amount`,
                                                            value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        void form.setFieldTouched(
                                                            `colors.${index}.amount`,
                                                        )
                                                    }
                                                    placeholder="بدون قیمت: تماس بگیرید"
                                                />
                                                <ProductColorImagesField
                                                    images={
                                                        query.data?.images ?? []
                                                    }
                                                    languageId={languageId}
                                                    mediaIds={
                                                        form.values.colors[
                                                            index
                                                        ]?.mediaIds ?? []
                                                    }
                                                    primaryMediaId={
                                                        form.values.colors[
                                                            index
                                                        ]?.primaryMediaId ??
                                                        null
                                                    }
                                                    disabled={save.isPending}
                                                    onChange={(
                                                        mediaIds,
                                                        primaryMediaId,
                                                    ) => {
                                                        void form.setFieldValue(
                                                            `colors.${index}.mediaIds`,
                                                            mediaIds,
                                                        )
                                                        void form.setFieldValue(
                                                            `colors.${index}.primaryMediaId`,
                                                            primaryMediaId,
                                                        )
                                                    }}
                                                />
                                            </FormItem>
                                        )
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                فیلد خالی یعنی تماس بگیرید. محدوده قیمت از قیمت
                                رنگ های انتخاب شده خودکار محاسبه میشود.
                            </p>
                        </>
                    )}
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" onClick={onClose}>
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        loading={save.isPending}
                        disabled={query.isPending || query.isError}
                    >
                        ذخیره قیمت گذاری
                    </Button>
                </FormDialogActions>
            </Form>
        </FormDialog>
    )
}
