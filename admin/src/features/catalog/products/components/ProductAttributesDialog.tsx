import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import FormDialog, {
    FormDialogActions,
    FormDialogBody,
} from '@/components/shared/FormDialog'
import Loading from '@/components/shared/Loading'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import RelationMultiSelect from '@/components/shared/RelationMultiSelect'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import type { Language } from '@/features/languages'
import { LanguageTabs } from '../../components/LanguageTabs'
import type { AttributeDefinition } from '../../types'
import { productsApi } from '../products.api'
import type { AttributeValueForm } from '../products.types'

type Props = {
    isOpen: boolean
    productId: string | null
    languages: Language[]
    attributes: AttributeDefinition[]
    attributesError: unknown
    attributesLoading: boolean
    defaultLanguageId?: string
    onClose: () => void
    onSaved: () => void
    onRetryAttributes: () => void
}

const typeLabels: Record<string, string> = {
    SHORT_TEXT: 'متن کوتاه',
    LONG_TEXT: 'متن بلند',
    NUMBER: 'عدد',
    BOOLEAN: 'بله یا خیر',
    SINGLE_SELECT: 'انتخاب تکی',
    MULTI_SELECT: 'انتخاب چندتایی',
    COLOR: 'رنگ',
}

const emptyTranslations = (languages: Language[]) =>
    languages.map((language) => ({
        languageId: language.id,
        textValue: '',
    }))

export default function ProductAttributesDialog({
    isOpen,
    productId,
    languages,
    attributes,
    attributesError,
    attributesLoading,
    defaultLanguageId,
    onClose,
    onSaved,
    onRetryAttributes,
}: Props) {
    const [values, setValues] = useState<AttributeValueForm[]>([])
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [activeLanguageId, setActiveLanguageId] = useState('')
    const contentDirection =
        languages.find((language) => language.id === activeLanguageId)
            ?.direction === 'LTR'
            ? 'ltr'
            : 'rtl'
    const detailQuery = useQuery({
        queryKey: ['catalog', 'product', productId],
        queryFn: () => productsApi.detail(productId as string),
        enabled: isOpen && Boolean(productId),
    })
    useEffect(() => {
        if (isOpen) setActiveLanguageId(languages[0]?.id ?? '')
    }, [isOpen, languages])
    useEffect(() => {
        const product = detailQuery.data
        if (!product) return
        setCategoryIds(product.categories.map((item) => item.categoryId))
        setValues(
            product.attributeValues.map((value) => ({
                attributeId: value.isCustom ? undefined : value.attributeId,
                customDefinition: value.isCustom
                    ? {
                          type: value.attribute.type,
                          translations: languages.map((language) => {
                              const translation =
                                  value.attribute.translations.find(
                                      (item) => item.languageId === language.id,
                                  )
                              return {
                                  languageId: language.id,
                                  name: translation?.name ?? '',
                                  description: translation?.description ?? '',
                                  unitLabel: translation?.unitLabel ?? '',
                              }
                          }),
                      }
                    : undefined,
                numberValue:
                    value.numberValue === null
                        ? undefined
                        : Number(value.numberValue),
                booleanValue: value.booleanValue ?? undefined,
                rawValue: value.rawValue ?? undefined,
                optionIds: value.selectedOptions.map((item) => item.optionId),
                displayOrder: value.displayOrder,
                translations: languages.map((language) => ({
                    languageId: language.id,
                    textValue:
                        value.translations.find(
                            (item) => item.languageId === language.id,
                        )?.textValue ?? '',
                })),
            })),
        )
    }, [detailQuery.data, languages])

    const automaticAttributes = useMemo(
        () =>
            attributes.filter(
                (attribute) =>
                    attribute.categories.length === 0 ||
                    attribute.categories.some((item) =>
                        categoryIds.includes(item.categoryId),
                    ),
            ),
        [attributes, categoryIds],
    )
    const isAutomatic = (attributeId: string) =>
        automaticAttributes.some((attribute) => attribute.id === attributeId)
    const manualIds = values.flatMap((value) =>
        value.attributeId && !isAutomatic(value.attributeId)
            ? [value.attributeId]
            : [],
    )
    const visibleAttributes = attributes.filter(
        (attribute) =>
            isAutomatic(attribute.id) || manualIds.includes(attribute.id),
    )
    const manualOptions = attributes
        .filter((attribute) => !isAutomatic(attribute.id))
        .map((attribute) => ({
            value: attribute.id,
            label:
                attribute.translations.find(
                    (item) => item.languageId === defaultLanguageId,
                )?.name ??
                attribute.translations[0]?.name ??
                'ویژگی بدون عنوان',
            description: typeLabels[attribute.type],
        }))
    const valueFor = (attribute: AttributeDefinition): AttributeValueForm =>
        values.find((value) => value.attributeId === attribute.id) ?? {
            attributeId: attribute.id,
            optionIds: [],
            displayOrder: attribute.displayOrder,
            translations: emptyTranslations(languages),
        }
    const setValue = (attributeId: string, value: AttributeValueForm) =>
        setValues((current) => [
            ...current.filter((item) => item.attributeId !== attributeId),
            value,
        ])
    const setManualIds = (ids: string[]) =>
        setValues((current) => {
            const kept = current.filter(
                (value) =>
                    !value.attributeId ||
                    isAutomatic(value.attributeId) ||
                    ids.includes(value.attributeId),
            )
            const added = ids
                .filter(
                    (attributeId) =>
                        !kept.some(
                            (value) => value.attributeId === attributeId,
                        ),
                )
                .map((attributeId) => ({
                    attributeId,
                    optionIds: [],
                    displayOrder:
                        attributes.find((item) => item.id === attributeId)
                            ?.displayOrder ?? kept.length,
                    translations: emptyTranslations(languages),
                }))
            return [...kept, ...added]
        })
    const addCustom = () =>
        setValues((current) => [
            ...current,
            {
                customDefinition: {
                    type: 'SHORT_TEXT',
                    translations: languages.map((language) => ({
                        languageId: language.id,
                        name: '',
                        description: '',
                        unitLabel: '',
                    })),
                },
                optionIds: [],
                displayOrder: current.length,
                translations: emptyTranslations(languages),
            },
        ])
    const saveMutation = useMutation({
        mutationFn: () =>
            productsApi.updateAttributes(productId as string, values),
        onSuccess: () => {
            onSaved()
            onClose()
        },
    })
    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (
            attributesLoading ||
            attributesError ||
            detailQuery.isPending ||
            detailQuery.isError
        )
            return
        saveMutation.mutate()
    }

    return (
        <FormDialog
            isOpen={isOpen}
            title="ویژگی های محصول"
            width={900}
            onClose={onClose}
        >
            <Form onSubmit={submit}>
                <FormDialogBody className="space-y-4">
                    {attributesLoading || detailQuery.isPending ? (
                        <Loading className="min-h-40" loading />
                    ) : attributesError ? (
                        <QueryErrorState
                            error={attributesError}
                            title="دریافت ویژگی ها با خطا مواجه شد."
                            onRetry={onRetryAttributes}
                        />
                    ) : detailQuery.isError ? (
                        <QueryErrorState
                            error={detailQuery.error}
                            title="دریافت محصول با خطا مواجه شد."
                            onRetry={() => void detailQuery.refetch()}
                        />
                    ) : (
                        <>
                            <LanguageTabs
                                activeId={activeLanguageId}
                                languages={languages}
                                onChange={setActiveLanguageId}
                            >
                                <></>
                            </LanguageTabs>
                            <div className="flex items-end gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                                <FormItem
                                    className="flex-1"
                                    label="افزودن ویژگی موجود"
                                >
                                    <RelationMultiSelect
                                        options={manualOptions}
                                        value={manualIds}
                                        onChange={setManualIds}
                                    />
                                </FormItem>
                                <Button type="button" onClick={addCustom}>
                                    ویژگی اختصاصی
                                </Button>
                            </div>
                            {visibleAttributes.map((attribute) => {
                                const value = valueFor(attribute)
                                const translation =
                                    attribute.translations.find(
                                        (item) =>
                                            item.languageId ===
                                            activeLanguageId,
                                    ) ?? attribute.translations[0]
                                const required = attribute.categories.some(
                                    (item) =>
                                        categoryIds.includes(item.categoryId) &&
                                        item.isRequired,
                                )
                                const options = attribute.options.map(
                                    (option) => ({
                                        value: option.id,
                                        label:
                                            option.translations.find(
                                                (item) =>
                                                    item.languageId ===
                                                    activeLanguageId,
                                            )?.label ??
                                            option.translations[0]?.label ??
                                            'بدون عنوان',
                                        color: option.colorHex,
                                    }),
                                )
                                return (
                                    <section
                                        key={attribute.id}
                                        className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            <strong>{translation?.name}</strong>
                                            <Tag>
                                                {isAutomatic(attribute.id)
                                                    ? 'ویژگی دسته بندی'
                                                    : 'ویژگی دستی'}
                                            </Tag>
                                            {required && <Tag>اجباری</Tag>}
                                        </div>
                                        <FormItem
                                            label={
                                                translation?.unitLabel
                                                    ? `مقدار (${translation.unitLabel})`
                                                    : 'مقدار'
                                            }
                                        >
                                            {attribute.type === 'NUMBER' ? (
                                                <Input
                                                    type="number"
                                                    value={
                                                        value.numberValue ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setValue(attribute.id, {
                                                            ...value,
                                                            numberValue: Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        })
                                                    }
                                                />
                                            ) : attribute.type === 'BOOLEAN' ? (
                                                <Checkbox
                                                    checked={
                                                        value.booleanValue ??
                                                        false
                                                    }
                                                    onChange={(checked) =>
                                                        setValue(attribute.id, {
                                                            ...value,
                                                            booleanValue:
                                                                checked,
                                                        })
                                                    }
                                                >
                                                    بله
                                                </Checkbox>
                                            ) : [
                                                  'SINGLE_SELECT',
                                                  'COLOR',
                                              ].includes(attribute.type) ? (
                                                <Select
                                                    isClearable
                                                    options={options}
                                                    value={options.find(
                                                        (option) =>
                                                            option.value ===
                                                            value.optionIds[0],
                                                    )}
                                                    onChange={(option) =>
                                                        setValue(attribute.id, {
                                                            ...value,
                                                            optionIds: option
                                                                ? [option.value]
                                                                : [],
                                                        })
                                                    }
                                                />
                                            ) : attribute.type ===
                                              'MULTI_SELECT' ? (
                                                <Select
                                                    isMulti
                                                    options={options}
                                                    value={options.filter(
                                                        (option) =>
                                                            value.optionIds.includes(
                                                                option.value,
                                                            ),
                                                    )}
                                                    onChange={(items) =>
                                                        setValue(attribute.id, {
                                                            ...value,
                                                            optionIds:
                                                                items.map(
                                                                    (item) =>
                                                                        item.value,
                                                                ),
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    dir={contentDirection}
                                                    textArea={
                                                        attribute.type ===
                                                        'LONG_TEXT'
                                                    }
                                                    value={
                                                        value.translations.find(
                                                            (item) =>
                                                                item.languageId ===
                                                                activeLanguageId,
                                                        )?.textValue ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setValue(attribute.id, {
                                                            ...value,
                                                            translations:
                                                                value.translations.map(
                                                                    (item) =>
                                                                        item.languageId ===
                                                                        activeLanguageId
                                                                            ? {
                                                                                  ...item,
                                                                                  textValue:
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                              }
                                                                            : item,
                                                                ),
                                                        })
                                                    }
                                                />
                                            )}
                                        </FormItem>
                                    </section>
                                )
                            })}
                            {values
                                .filter((value) => value.customDefinition)
                                .map((value) => {
                                    const actualIndex = values.indexOf(value)
                                    const definition =
                                        value.customDefinition?.translations.find(
                                            (item) =>
                                                item.languageId ===
                                                activeLanguageId,
                                        )
                                    const translation = value.translations.find(
                                        (item) =>
                                            item.languageId ===
                                            activeLanguageId,
                                    )
                                    return (
                                        <section
                                            key={`custom-${actualIndex}`}
                                            className="grid gap-3 rounded-xl border border-primary/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
                                        >
                                            <FormItem label="عنوان ویژگی اختصاصی">
                                                <Input
                                                    dir={contentDirection}
                                                    value={
                                                        definition?.name ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setValues((current) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                        actualIndex &&
                                                                    item.customDefinition
                                                                        ? {
                                                                              ...item,
                                                                              customDefinition:
                                                                                  {
                                                                                      ...item.customDefinition,
                                                                                      translations:
                                                                                          item.customDefinition.translations.map(
                                                                                              (
                                                                                                  entry,
                                                                                              ) =>
                                                                                                  entry.languageId ===
                                                                                                  activeLanguageId
                                                                                                      ? {
                                                                                                            ...entry,
                                                                                                            name: event
                                                                                                                .target
                                                                                                                .value,
                                                                                                        }
                                                                                                      : entry,
                                                                                          ),
                                                                                  },
                                                                          }
                                                                        : item,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormItem>
                                            <FormItem label="مقدار">
                                                <Input
                                                    dir={contentDirection}
                                                    value={
                                                        translation?.textValue ??
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        setValues((current) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    actualIndex
                                                                        ? {
                                                                              ...item,
                                                                              translations:
                                                                                  item.translations.map(
                                                                                      (
                                                                                          entry,
                                                                                      ) =>
                                                                                          entry.languageId ===
                                                                                          activeLanguageId
                                                                                              ? {
                                                                                                    ...entry,
                                                                                                    textValue:
                                                                                                        event
                                                                                                            .target
                                                                                                            .value,
                                                                                                }
                                                                                              : entry,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormItem>
                                            <Button
                                                className="self-end"
                                                size="sm"
                                                type="button"
                                                onClick={() =>
                                                    setValues((current) =>
                                                        current.filter(
                                                            (_, itemIndex) =>
                                                                itemIndex !==
                                                                actualIndex,
                                                        ),
                                                    )
                                                }
                                            >
                                                حذف
                                            </Button>
                                        </section>
                                    )
                                })}
                        </>
                    )}
                </FormDialogBody>
                <FormDialogActions>
                    <Button type="button" onClick={onClose}>
                        انصراف
                    </Button>
                    <Button
                        disabled={
                            attributesLoading ||
                            Boolean(attributesError) ||
                            detailQuery.isPending ||
                            detailQuery.isError
                        }
                        loading={saveMutation.isPending}
                        type="submit"
                        variant="solid"
                    >
                        ذخیره ویژگی ها
                    </Button>
                </FormDialogActions>
            </Form>
        </FormDialog>
    )
}
