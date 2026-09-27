import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import { Form, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { siteContentApi, siteKeys } from '../site-content.api'
import { messageStatuses, type MessageStatus } from '../site-content.types'
export default function MessageDetailDialog({
    id,
    onClose,
}: {
    id: string
    onClose: () => void
}) {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: [...siteKeys.messages, id],
        queryFn: () => siteContentApi.message(id),
    })
    const [status, setStatus] = useState<MessageStatus | null>(null)
    const save = useMutation({
        mutationFn: () =>
            siteContentApi.status(id, status ?? query.data!.status),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: siteKeys.messages })
            onClose()
        },
    })
    return (
        <FormDialog
            isOpen
            title="پیام دریافتی"
            width={720}
            isPending={save.isPending}
            onClose={onClose}
        >
            <Form
                onSubmit={(e) => {
                    e.preventDefault()
                    if (query.data && !save.isPending) save.mutate()
                }}
            >
                <FormDialogBody>
                    {query.isPending ? (
                        <Loading loading />
                    ) : query.isError ? (
                        <QueryErrorState
                            error={query.error}
                            title="دریافت پیام ناموفق بود."
                            onRetry={() => void query.refetch()}
                        />
                    ) : (
                        <>
                            <dl className="mb-5 space-y-3">
                                <div>
                                    <dt className="text-gray-500">فرستنده</dt>
                                    <dd>{query.data.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">تلفن</dt>
                                    <dd>
                                        <a
                                            href={`tel:${query.data.phone}`}
                                            dir="ltr"
                                        >
                                            {query.data.phone}
                                        </a>
                                    </dd>
                                </div>
                                {query.data.email && (
                                    <div>
                                        <dt className="text-gray-500">ایمیل</dt>
                                        <dd>
                                            <a
                                                href={`mailto:${query.data.email}`}
                                                dir="ltr"
                                            >
                                                {query.data.email}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-gray-500">موضوع</dt>
                                    <dd>{query.data.subject}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">متن پیام</dt>
                                    <dd className="whitespace-pre-wrap break-words rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                                        {query.data.message}
                                    </dd>
                                </div>
                            </dl>
                            <FormItem label="وضعیت پیگیری">
                                <Select
                                    options={messageStatuses}
                                    value={messageStatuses.find(
                                        (s) =>
                                            s.value ===
                                            (status ?? query.data.status),
                                    )}
                                    onChange={(option) => {
                                        if (option) setStatus(option.value)
                                    }}
                                />
                            </FormItem>
                        </>
                    )}
                </FormDialogBody>
                <FormDialogActions>
                    <Button
                        type="button"
                        disabled={save.isPending}
                        onClick={onClose}
                    >
                        بستن
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        disabled={!query.data}
                        loading={save.isPending}
                    >
                        ذخیره وضعیت
                    </Button>
                </FormDialogActions>
            </Form>
        </FormDialog>
    )
}
