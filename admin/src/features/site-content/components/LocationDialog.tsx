import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikProvider, useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import MapLocationPicker from '@/components/shared/MapLocationPicker'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import { Form } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi, siteKeys } from '../site-content.api'
export default function LocationDialog({ onClose }: { onClose: () => void }) {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.location,
        queryFn: siteContentApi.location,
    })
    const save = useMutation({
        mutationFn: (values: { latitude: string; longitude: string }) =>
            siteContentApi.saveLocation({
                latitude: values.latitude.trim()
                    ? Number(values.latitude)
                    : null,
                longitude: values.longitude.trim()
                    ? Number(values.longitude)
                    : null,
            }),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: siteKeys.location })
            onClose()
        },
    })
    const form = useFormik({
        initialValues: {
            latitude: query.data?.latitude?.toString() ?? '',
            longitude: query.data?.longitude?.toString() ?? '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            latitude: Yup.number()
                .transform((v, o) => (o === '' ? null : v))
                .nullable()
                .min(-90, 'بین منفی ۹۰ و ۹۰')
                .max(90, 'بین منفی ۹۰ و ۹۰')
                .typeError('عدد معتبر وارد کنید.'),
            longitude: Yup.number()
                .transform((v, o) => (o === '' ? null : v))
                .nullable()
                .min(-180, 'بین منفی ۱۸۰ و ۱۸۰')
                .max(180, 'بین منفی ۱۸۰ و ۱۸۰')
                .typeError('عدد معتبر وارد کنید.'),
        }),
        onSubmit: (values) => {
            if (
                Boolean(values.latitude.trim()) !==
                Boolean(values.longitude.trim())
            ) {
                toast.error('هر دو مختصات را وارد کنید.')
                return
            }
            save.mutate(values)
        },
    })
    return (
        <FormDialog
            isOpen
            title="موقعیت روی نقشه"
            width={900}
            isPending={save.isPending}
            onClose={onClose}
        >
            <FormikProvider value={form}>
                <Form onSubmit={form.handleSubmit}>
                    <FormDialogBody className="space-y-5">
                        {query.isPending ? (
                            <Loading loading />
                        ) : query.isError ? (
                            <QueryErrorState
                                error={query.error}
                                title="دریافت موقعیت ناموفق بود."
                                onRetry={() => void query.refetch()}
                            />
                        ) : (
                            <>
                                <p className="text-sm text-gray-500">
                                    روی محل مورد نظر در نقشه کلیک کنید. برای
                                    تغییر موقعیت، نقطه دیگری را انتخاب کنید.
                                </p>
                                <MapLocationPicker
                                    disabled={save.isPending}
                                    value={
                                        form.values.latitude &&
                                        form.values.longitude
                                            ? {
                                                  latitude: Number(
                                                      form.values.latitude,
                                                  ),
                                                  longitude: Number(
                                                      form.values.longitude,
                                                  ),
                                              }
                                            : null
                                    }
                                    onChange={(point) =>
                                        void form.setValues({
                                            latitude: String(point.latitude),
                                            longitude: String(point.longitude),
                                        })
                                    }
                                />
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p
                                        className="text-sm text-gray-500"
                                        dir="ltr"
                                    >
                                        {form.values.latitude &&
                                        form.values.longitude
                                            ? `${Number(form.values.latitude).toFixed(5)} / ${Number(form.values.longitude).toFixed(5)}`
                                            : 'موقعیتی انتخاب نشده است.'}
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            save.isPending ||
                                            !form.values.latitude
                                        }
                                        onClick={() =>
                                            void form.setValues({
                                                latitude: '',
                                                longitude: '',
                                            })
                                        }
                                    >
                                        حذف موقعیت
                                    </Button>
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
                            disabled={query.isPending || query.isError}
                            loading={save.isPending}
                        >
                            ذخیره موقعیت
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormikProvider>
        </FormDialog>
    )
}
