import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { apiClient } from '@/lib/http/api-client'
import type { ApiResponse } from '@/lib/http/api.types'
import type { Language } from '@/features/languages'
import type { MediaAsset } from '@/features/media'
import { LanguageTabs } from './LanguageTabs'

type TranslationForm = {
    languageId: string
    title: string
    altText: string
    caption: string
}

type Props = {
    asset: MediaAsset | null
    onClose: () => void
    onSaved?: (asset: MediaAsset) => void
}

export default function MediaTranslationDialog({
    asset,
    onClose,
    onSaved,
}: Props) {
    const client = useQueryClient()
    const [activeLanguageId, setActiveLanguageId] = useState('')
    const [translations, setTranslations] = useState<TranslationForm[]>([])
    const languagesQuery = useQuery({
        queryKey: ['languages'],
        enabled: asset !== null,
        queryFn: async () =>
            (await apiClient.get<ApiResponse<Language[]>>('languages')).data
                .data ?? [],
    })
    const languages = useMemo(
        () =>
            (languagesQuery.data ?? []).filter((language) => language.isActive),
        [languagesQuery.data],
    )

    useEffect(() => {
        if (!asset || languages.length === 0) return
        setTranslations(
            languages.map((language) => {
                const translation = asset.translations.find(
                    (item) => item.languageId === language.id,
                )
                return {
                    languageId: language.id,
                    title: translation?.title ?? '',
                    altText: translation?.altText ?? '',
                    caption: translation?.caption ?? '',
                }
            }),
        )
        setActiveLanguageId(languages[0].id)
    }, [asset, languages])

    const save = useMutation({
        mutationFn: () =>
            apiClient.patch<ApiResponse<MediaAsset>>(
                `media/${asset?.id}/translations`,
                {
                    translations: translations.filter(
                        (item) =>
                            item.title.trim() ||
                            item.altText.trim() ||
                            item.caption.trim(),
                    ),
                },
            ),
        onSuccess: (response) => {
            const updated = response.data.data
            if (updated) {
                onSaved?.(updated)
                client.setQueryData<MediaAsset[]>(['media'], (current) =>
                    (current ?? []).map((item) =>
                        item.id === updated.id ? updated : item,
                    ),
                )
            }
            onClose()
        },
    })
    const current = translations.find(
        (item) => item.languageId === activeLanguageId,
    )
    const direction =
        languages.find((item) => item.id === activeLanguageId)?.direction ===
        'LTR'
            ? 'ltr'
            : 'rtl'
    const update = (patch: Partial<TranslationForm>) =>
        setTranslations((items) =>
            items.map((item) =>
                item.languageId === activeLanguageId
                    ? { ...item, ...patch }
                    : item,
            ),
        )
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (asset) save.mutate()
    }

    return (
        <FormDialog
            isOpen={asset !== null}
            title="اطلاعات تصویر"
            width={680}
            onClose={onClose}
        >
            <Form onSubmit={submit}>
                <FormDialogBody>
                    <LanguageTabs
                        activeId={activeLanguageId}
                        languages={languages}
                        onChange={setActiveLanguageId}
                    >
                        {current && (
                            <div className="space-y-4">
                                <FormItem label="عنوان">
                                    <Input
                                        dir={direction}
                                        value={current.title}
                                        onChange={(event) =>
                                            update({
                                                title: event.target.value,
                                            })
                                        }
                                    />
                                </FormItem>
                                <FormItem label="متن جایگزین تصویر">
                                    <Input
                                        dir={direction}
                                        value={current.altText}
                                        onChange={(event) =>
                                            update({
                                                altText: event.target.value,
                                            })
                                        }
                                    />
                                </FormItem>
                                <FormItem label="توضیح تصویر">
                                    <Input
                                        dir={direction}
                                        rows={3}
                                        textArea
                                        value={current.caption}
                                        onChange={(event) =>
                                            update({
                                                caption: event.target.value,
                                            })
                                        }
                                    />
                                </FormItem>
                            </div>
                        )}
                    </LanguageTabs>
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" onClick={onClose}>
                        انصراف
                    </Button>
                    <Button
                        loading={save.isPending}
                        type="submit"
                        variant="solid"
                    >
                        ذخیره
                    </Button>
                </FormDialogActions>
            </Form>
        </FormDialog>
    )
}
