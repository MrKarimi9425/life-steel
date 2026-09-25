import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import ListPageLayout, {
    ListPageContent,
} from '@/components/shared/ListPageLayout'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '../types'

type Phrase = {
    id: string
    key: string
    namespace: string
    description: string | null
    translations: Array<{ languageId: string; value: string }>
}

export function InterfacePhrasesPage() {
    const client = useQueryClient()
    const [values, setValues] = useState<
        Record<string, Record<string, string>>
    >({})
    const languages = useQuery({
        queryKey: ['languages'],
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Language[]>>('languages')).data
                .data ?? [],
    })
    const phrases = useQuery({
        queryKey: ['interface-phrases'],
        queryFn: async () =>
            (
                await apiClient.get<ApiResponse<Phrase[]>>(
                    'languages/interface-phrases',
                )
            ).data.data ?? [],
    })
    useEffect(() => {
        if (!phrases.data) return
        setValues(
            Object.fromEntries(
                phrases.data.map((phrase) => [
                    phrase.id,
                    Object.fromEntries(
                        phrase.translations.map((translation) => [
                            translation.languageId,
                            translation.value,
                        ]),
                    ),
                ]),
            ),
        )
    }, [phrases.data])
    const mutation = useMutation({
        mutationFn: (phrase: Phrase) =>
            apiClient.put('languages/interface-phrases', {
                key: phrase.key,
                namespace: phrase.namespace,
                description: phrase.description ?? '',
                translations: (languages.data ?? []).map((language) => ({
                    languageId: language.id,
                    value: values[phrase.id]?.[language.id] ?? '',
                })),
            }),
        onSuccess: () =>
            void client.invalidateQueries({ queryKey: ['interface-phrases'] }),
    })

    return (
        <ListPageLayout
            title="عبارت های ثابت سایت"
            subtitle="ترجمه متن های عمومی رابط سایت برای همه زبان های فعال"
        >
            <ListPageContent>
                {phrases.isError ? (
                    <QueryErrorState
                        error={phrases.error}
                        title="دریافت عبارت ها با خطا مواجه شد."
                        onRetry={() => void phrases.refetch()}
                    />
                ) : phrases.isPending ? (
                    <Loading className="min-h-72" loading />
                ) : (
                    <div className="space-y-4">
                        {phrases.data?.map((phrase) => (
                            <Card
                                key={phrase.id}
                                header={{
                                    content: `${phrase.namespace} / ${phrase.key}`,
                                }}
                            >
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {languages.data
                                        ?.filter(
                                            (language) => language.isActive,
                                        )
                                        .map((language) => (
                                            <label
                                                key={language.id}
                                                className="block text-sm font-semibold"
                                            >
                                                {language.name}
                                                <Input
                                                    className="mt-2"
                                                    dir={
                                                        language.direction ===
                                                        'RTL'
                                                            ? 'rtl'
                                                            : 'ltr'
                                                    }
                                                    value={
                                                        values[phrase.id]?.[
                                                            language.id
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setValues(
                                                            (current) => ({
                                                                ...current,
                                                                [phrase.id]: {
                                                                    ...current[
                                                                        phrase
                                                                            .id
                                                                    ],
                                                                    [language.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            }),
                                                        )
                                                    }
                                                />
                                            </label>
                                        ))}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        loading={mutation.isPending}
                                        onClick={() => mutation.mutate(phrase)}
                                    >
                                        ذخیره ترجمه
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </ListPageContent>
        </ListPageLayout>
    )
}
