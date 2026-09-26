import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import EditIcon from '@/assets/icons/iconsax/linear/edit-2.svg?react'
import LockIcon from '@/assets/icons/iconsax/linear/lock.svg?react'
import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import ListFilters from '@/components/shared/ListFilters'
import ListPageLayout from '@/components/shared/ListPageLayout'
import ListSearchInput from '@/components/shared/ListSearchInput'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import TableActionButton from '@/components/shared/TableActionButton'
import TableActions from '@/components/shared/TableActions'
import TableEmptyStateIcon from '@/components/shared/TableEmptyStateIcon'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'

type Admin = {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    isOwner: boolean
    mustChangePassword: boolean
    status: 'ACTIVE' | 'DISABLED'
    lastLoginAt: string | null
}

const queryKey = ['admins'] as const

export function AdminsPage() {
    const client = useQueryClient()
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
        null,
    )
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    })
    const query = useQuery({
        queryKey,
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Admin[]>>('admins')).data.data ??
            [],
    })
    const refresh = () => client.invalidateQueries({ queryKey })
    const createMutation = useMutation({
        mutationFn: async () =>
            (
                await apiClient.post<
                    ApiResponse<{ admin: Admin; temporaryPassword: string }>
                >('admins', form)
            ).data.data,
        onSuccess: (data) => {
            setCreateOpen(false)
            setForm({ firstName: '', lastName: '', phoneNumber: '' })
            setTemporaryPassword(data?.temporaryPassword ?? null)
            void refresh()
        },
    })
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Admin['status'] }) =>
            apiClient.patch(`admins/${id}/status`, { status }),
        onSuccess: () => void refresh(),
    })
    const resetMutation = useMutation({
        mutationFn: async (id: string) =>
            (
                await apiClient.post<
                    ApiResponse<{ temporaryPassword: string }>
                >(`admins/${id}/reset-password`)
            ).data.data,
        onSuccess: (data) =>
            setTemporaryPassword(data?.temporaryPassword ?? null),
    })
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (!form.firstName || !form.lastName || !form.phoneNumber) {
            toast.error('همه فیلدها را کامل کنید.')
            return
        }
        createMutation.mutate()
    }
    const columns = useMemo<ColumnDef<Admin>[]>(
        () => [
            {
                header: 'نام',
                id: 'name',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                        <span>{row.original.firstName} {row.original.lastName}</span>
                        {row.original.isOwner && (
                            <span className="shrink-0 text-xs text-primary">
                                مدیر اصلی
                            </span>
                        )}
                    </div>
                ),
            },
            {
                header: 'شماره تلفن',
                accessorKey: 'phoneNumber',
                cell: ({ row }) => (
                    <span dir="ltr">{row.original.phoneNumber}</span>
                ),
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: ({ row }) => (
                    <Tag>
                        {row.original.status === 'ACTIVE' ? 'فعال' : 'غیر فعال'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'actions',
                cell: ({ row }) =>
                    row.original.isOwner ? null : (
                        <TableActions>
                            <TableActionButton
                                icon={<EditIcon height={18} width={18} />}
                                label={
                                    row.original.status === 'ACTIVE'
                                        ? 'غیر فعال کردن'
                                        : 'فعال کردن'
                                }
                                tone="edit"
                                onClick={() =>
                                    statusMutation.mutate({
                                        id: row.original.id,
                                        status:
                                            row.original.status === 'ACTIVE'
                                                ? 'DISABLED'
                                                : 'ACTIVE',
                                    })
                                }
                            />
                            <TableActionButton
                                icon={<LockIcon height={18} width={18} />}
                                label="رمز موقت جدید"
                                tone="view"
                                onClick={() =>
                                    resetMutation.mutate(row.original.id)
                                }
                            />
                        </TableActions>
                    ),
            },
        ],
        [statusMutation, resetMutation],
    )
    const visible = (query.data ?? []).filter((admin) =>
        `${admin.firstName} ${admin.lastName} ${admin.phoneNumber}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    )

    return (
        <>
            <ListPageLayout
                title="مدیریت ادمین ها"
                subtitle="ایجاد ادمین با رمز موقت و مدیریت وضعیت حساب"
                actions={
                    <Button
                        icon={<AddIcon height={20} width={20} />}
                        variant="solid"
                        onClick={() => setCreateOpen(true)}
                    >
                        ادمین جدید
                    </Button>
                }
                filters={
                    <ListFilters>
                        <ListSearchInput
                            placeholder="جستجو در ادمین ها"
                            onSearch={setSearch}
                        />
                    </ListFilters>
                }
            >
                {query.isError ? (
                    <QueryErrorState
                        error={query.error}
                        title="دریافت ادمین ها با خطا مواجه شد."
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        customNoDataIcon={<TableEmptyStateIcon />}
                        data={visible}
                        loading={query.isPending}
                    />
                )}
            </ListPageLayout>
            <FormDialog
                isOpen={createOpen}
                title="ایجاد ادمین"
                width={520}
                onClose={() => setCreateOpen(false)}
            >
                <Form onSubmit={submit}>
                    <FormDialogBody className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormItem asterisk label="نام">
                                <Input
                                    value={form.firstName}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            firstName: event.target.value,
                                        })
                                    }
                                />
                            </FormItem>
                            <FormItem asterisk label="نام خانوادگی">
                                <Input
                                    value={form.lastName}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            lastName: event.target.value,
                                        })
                                    }
                                />
                            </FormItem>
                        </div>
                        <FormItem asterisk label="شماره موبایل">
                            <Input
                                dir="ltr"
                                inputMode="numeric"
                                maxLength={11}
                                placeholder="09123456789"
                                value={form.phoneNumber}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        phoneNumber: event.target.value,
                                    })
                                }
                            />
                        </FormItem>
                    </FormDialogBody>
                    <FormDialogActions>
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(false)}
                        >
                            انصراف
                        </Button>
                        <Button
                            loading={createMutation.isPending}
                            type="submit"
                            variant="solid"
                        >
                            ایجاد ادمین
                        </Button>
                    </FormDialogActions>
                </Form>
            </FormDialog>
            <FormDialog
                isOpen={Boolean(temporaryPassword)}
                title="رمز موقت"
                width={520}
                onClose={() => setTemporaryPassword(null)}
            >
                <FormDialogBody>
                    <p className="mb-4 text-sm text-gray-500">
                        این رمز فقط همین یک بار نمایش داده می شود. آن را به صورت
                        امن در اختیار ادمین قرار دهید.
                    </p>
                    <div
                        className="rounded-xl bg-gray-100 p-4 text-center font-mono text-lg"
                        dir="ltr"
                    >
                        {temporaryPassword}
                    </div>
                </FormDialogBody>
                <FormDialogActions>
                    <Button
                        variant="solid"
                        onClick={() => setTemporaryPassword(null)}
                    >
                        بستن
                    </Button>
                </FormDialogActions>
            </FormDialog>
        </>
    )
}
