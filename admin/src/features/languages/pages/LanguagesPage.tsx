import { useState, type FormEvent } from 'react'
import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import TableActions from '@/components/shared/TableActions'
import TableActionButton from '@/components/shared/TableActionButton'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Tag from '@/components/ui/Tag'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '../types'
import { useListReorder } from '@/hooks/useListReorder'

const queryKey = ['languages'] as const
const directionOptions = [
    { value: 'LTR', label: 'چپ چین' },
    { value: 'RTL', label: 'راست چین' },
] as const
const emptyForm: {
    code: string
    name: string
    nativeName: string
    direction: 'RTL' | 'LTR'
    isActive: boolean
    isRequiredForPublish: boolean
} = {
    code: '',
    name: '',
    nativeName: '',
    direction: 'LTR' as const,
    isActive: true,
    isRequiredForPublish: false,
}

export function LanguagesPage() {
    const client = useQueryClient()
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const response =
                await apiClient.get<ApiResponse<Language[]>>('languages')
            return response.data.data ?? []
        },
    })
    const refresh = () => client.invalidateQueries({ queryKey })
    const reorder = useListReorder<Language>(queryKey, 'languages/order')
    const createMutation = useMutation({
        mutationFn: () => apiClient.post('languages', form),
        onSuccess: () => {
            setOpen(false)
            setForm(emptyForm)
            void refresh()
        },
    })
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Language> }) =>
            apiClient.patch(`languages/${id}`, data),
        onSuccess: () => void refresh(),
    })
    const defaultMutation = useMutation({
        mutationFn: (id: string) => apiClient.post(`languages/${id}/default`),
        onSuccess: () => void refresh(),
    })

    const submit = (event: FormEvent) => {
        event.preventDefault()
        createMutation.mutate()
    }
    const columns: ColumnDef<Language>[] = [
        {
            header: 'زبان',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {row.original.name}
                    <span className="mr-2 text-xs text-gray-500">
                        ({row.original.nativeName})
                    </span>
                </div>
            ),
        },
        {
            header: 'کد',
            accessorKey: 'code',
            cell: ({ row }) => <span dir="ltr">{row.original.code}</span>,
        },
        {
            header: 'جهت',
            accessorKey: 'direction',
            cell: ({ row }) =>
                row.original.direction === 'RTL' ? 'راست چین' : 'چپ چین',
        },
        {
            header: 'انتشار',
            accessorKey: 'isRequiredForPublish',
            cell: ({ row }) => (
                <Tag>
                    {row.original.isRequiredForPublish ? 'الزامی' : 'اختیاری'}
                </Tag>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <TableActions>
                    {!row.original.isDefault && (
                        <TableActionButton
                            icon={<EditIcon height={18} width={18} />}
                            label="پیش فرض"
                            tone="view"
                            onClick={() =>
                                defaultMutation.mutate(row.original.id)
                            }
                        />
                    )}
                    {!row.original.isDefault && (
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() =>
                                updateMutation.mutate({
                                    id: row.original.id,
                                    data: { isActive: !row.original.isActive },
                                })
                            }
                        >
                            {row.original.isActive ? 'غیر فعال' : 'فعال'}
                        </Button>
                    )}
                </TableActions>
            ),
        },
    ]

    return (
        <>
            <ListPageLayout
                title="زبان های سایت"
                subtitle="زبان های محتوا و وضعیت الزام ترجمه برای انتشار"
                actions={
                    <Button
                        icon={<AddIcon height={20} width={20} />}
                        variant="solid"
                        onClick={() => setOpen(true)}
                    >
                        زبان جدید
                    </Button>
                }
            >
                {query.isError ? (
                    <QueryErrorState
                        error={query.error}
                        title="دریافت زبان ها با خطا مواجه شد."
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        customNoDataIcon={<TableEmptyStateIcon />}
                        data={query.data ?? []}
                        dragDisabled={reorder.isPending}
                        draggable
                        getRowId={(language) => language.id}
                        loading={query.isPending}
                        paginate={false}
                        onReorder={(items) => reorder.mutate(items)}
                    />
                )}
            </ListPageLayout>
            <FormDialog
                isOpen={open}
                title="افزودن زبان"
                width={560}
                onClose={() => setOpen(false)}
            >
                <Form onSubmit={submit}>
                    <FormDialogBody className="space-y-4">
                        <FormItem asterisk label="کد زبان">
                            <Input
                                dir="ltr"
                                placeholder="مانند ar"
                                value={form.code}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        code: event.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem asterisk label="نام زبان در پنل">
                            <Input
                                value={form.name}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem asterisk label="نام بومی زبان">
                            <Input
                                value={form.nativeName}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        nativeName: event.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label="جهت نوشتار">
                            <Select
                                isSearchable={false}
                                options={directionOptions}
                                value={directionOptions.find(
                                    (option) => option.value === form.direction,
                                )}
                                onChange={(option) =>
                                    setForm({
                                        ...form,
                                        direction: option?.value ?? 'LTR',
                                    })
                                }
                            />
                        </FormItem>
                        <Checkbox
                            checked={form.isRequiredForPublish}
                            onChange={(checked) =>
                                setForm({
                                    ...form,
                                    isRequiredForPublish: checked,
                                })
                            }
                        >
                            ترجمه این زبان برای انتشار الزامی باشد
                        </Checkbox>
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button type="button" onClick={() => setOpen(false)}>
                            انصراف
                        </Button>
                        <Button
                            loading={createMutation.isPending}
                            type="submit"
                            variant="solid"
                        >
                            ذخیره زبان
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormDialog>
        </>
    )
}
