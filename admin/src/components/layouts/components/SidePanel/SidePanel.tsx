import Setting2Icon from '@/assets/icons/iconsax/linear/setting-2.svg?react'
import TickIcon from '@/assets/icons/iconsax/linear/tick.svg?react'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import {
    usePanelPreferencesStore,
    type PanelTheme,
    type TableDensity,
} from '@/store/panelPreferencesStore'
import classNames from 'classnames'
import { panelThemeSchemas } from '@/configs/panel-theme-schemas'
import type { CommonProps } from '@/@types/common'

const themeOptions: { label: string; value: PanelTheme }[] = [
    { label: 'روشن', value: 'light' },
    { label: 'تاریک', value: 'dark' },
    { label: 'سیستم', value: 'system' },
]

const densityOptions: { label: string; value: TableDensity }[] = [
    { label: 'راحت', value: 'comfortable' },
    { label: 'معمولی', value: 'default' },
    { label: 'فشرده', value: 'compact' },
]

const getContrastTextColor = (backgroundColor: string) => {
    const hex = backgroundColor.replace('#', '')
    const red = Number.parseInt(hex.slice(0, 2), 16)
    const green = Number.parseInt(hex.slice(2, 4), 16)
    const blue = Number.parseInt(hex.slice(4, 6), 16)
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000

    return luminance > 160 ? '#171717' : '#ffffff'
}

function OptionGroup<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { label: string; value: T }[]
    value: T
    onChange: (value: T) => void
}) {
    return (
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={classNames(
                        'min-h-10 rounded-lg px-2 text-sm font-semibold transition-colors',
                        value === option.value
                            ? 'bg-white text-primary shadow-sm dark:bg-gray-800'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
                    )}
                    type="button"
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

const SidePanelContent = ({ className }: CommonProps) => {
    const [open, setOpen] = useState(false)
    const preferences = usePanelPreferencesStore()

    return (
        <>
            <button
                aria-label="تنظیمات پنل"
                className={`text-2xl ${className ?? ''}`}
                type="button"
                onClick={() => setOpen(true)}
            >
                <Setting2Icon aria-hidden="true" focusable="false" />
            </button>
            <Drawer
                bodyClass="flex flex-col gap-6"
                isOpen={open}
                placement="left"
                title="تنظیمات پنل"
                width={360}
                onClose={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
            >
                <section className="space-y-3">
                    <div>
                        <h6>حالت نمایش</h6>
                        <p className="mt-1 text-xs text-gray-500">
                            ظاهر روشن، تاریک یا هماهنگ با سیستم
                        </p>
                    </div>
                    <OptionGroup
                        options={themeOptions}
                        value={preferences.theme}
                        onChange={preferences.setTheme}
                    />
                </section>

                <section className="space-y-3">
                    <div>
                        <h6>رنگ تم</h6>
                        <p className="mt-1 text-xs text-gray-500">
                            رنگ اصلی اجزای تعاملی پنل
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {Object.entries(panelThemeSchemas).map(
                            ([schema, definition]) => {
                                const selected =
                                    preferences.themeSchema === schema
                                const resolvedMode =
                                    preferences.theme === 'dark'
                                        ? 'dark'
                                        : 'light'
                                const selectedColor =
                                    definition[resolvedMode].primary

                                return (
                                    <button
                                        key={schema}
                                        aria-label={`رنگ تم ${schema}`}
                                        aria-pressed={selected}
                                        className={classNames(
                                            'flex size-8 items-center justify-center rounded-full border-2 border-white shadow-sm',
                                            selected &&
                                                'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800',
                                        )}
                                        style={{
                                            backgroundColor: selectedColor,
                                        }}
                                        type="button"
                                        onClick={() =>
                                            preferences.setThemeSchema(
                                                schema as keyof typeof panelThemeSchemas,
                                            )
                                        }
                                    >
                                        {selected && (
                                            <TickIcon
                                                aria-hidden="true"
                                                focusable="false"
                                                color={getContrastTextColor(
                                                    selectedColor,
                                                )}
                                                height={18}
                                                width={18}
                                            />
                                        )}
                                    </button>
                                )
                            },
                        )}
                    </div>
                </section>

                <section className="space-y-3">
                    <div>
                        <h6>تراکم جدول ها</h6>
                        <p className="mt-1 text-xs text-gray-500">
                            فاصله عمودی ردیف های جدول را مشخص می کند
                        </p>
                    </div>
                    <OptionGroup
                        options={densityOptions}
                        value={preferences.tableDensity}
                        onChange={preferences.setTableDensity}
                    />
                </section>

                <section className="space-y-3">
                    <div>
                        <h6>تعداد ردیف پیش فرض</h6>
                        <p className="mt-1 text-xs text-gray-500">
                            برای جدول هایی که صفحه بندی دارند
                        </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[10, 25, 50, 100].map((pageSize) => (
                            <button
                                key={pageSize}
                                className={classNames(
                                    'min-h-10 rounded-lg border text-sm font-semibold transition-colors',
                                    preferences.defaultPageSize === pageSize
                                        ? 'border-primary bg-primary-subtle text-primary'
                                        : 'border-gray-200 hover:border-primary dark:border-gray-600',
                                )}
                                type="button"
                                onClick={() =>
                                    preferences.setDefaultPageSize(pageSize)
                                }
                            >
                                {pageSize.toLocaleString('fa-IR')}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div>
                        <h6>اعلان های پنل</h6>
                        <p className="mt-1 text-xs text-gray-500">
                            نمایش اعلان ها و پیام های سیستمی
                        </p>
                    </div>
                    <button
                        aria-pressed={preferences.notificationsEnabled}
                        className={classNames(
                            'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                            preferences.notificationsEnabled
                                ? 'bg-primary'
                                : 'bg-gray-300 dark:bg-gray-600',
                        )}
                        type="button"
                        onClick={() =>
                            preferences.setNotificationsEnabled(
                                !preferences.notificationsEnabled,
                            )
                        }
                    >
                        <span
                            className={classNames(
                                'absolute top-1 size-5 rounded-full bg-white shadow transition-all',
                                preferences.notificationsEnabled
                                    ? 'right-6'
                                    : 'right-1',
                            )}
                        />
                    </button>
                </section>

                <Button
                    block
                    className="mt-auto"
                    variant="default"
                    onClick={preferences.reset}
                >
                    بازگردانی تنظیمات اولیه
                </Button>
            </Drawer>
        </>
    )
}

const SidePanel = withHeaderItem(SidePanelContent)

export default SidePanel
