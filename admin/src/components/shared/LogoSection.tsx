import GalleryIcon from '@/assets/icons/iconsax/linear/gallery.svg?react'
import TrashIcon from '@/assets/icons/iconsax/linear/trash.svg?react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'

interface LogoSectionProps {
    description?: string
    error?: string
    logoPreview: string | null
    title?: string
    onChange: (file: File) => void
    onRemove: () => void
}

export default function LogoSection({
    description = 'لوگو مستقل از تصاویر گالری ذخیره می شود.',
    logoPreview,
    error,
    title = 'لوگوی پروژه',
    onChange,
    onRemove,
}: LogoSectionProps) {
    return (
        <Card>
            <h4 className="mb-2">{title}</h4>
            <p>{description}</p>
            <div className="mt-4 flex items-center gap-4">
                <Avatar
                    icon={
                        !logoPreview ? (
                            <GalleryIcon
                                aria-hidden="true"
                                focusable="false"
                                height={24}
                                width={24}
                            />
                        ) : undefined
                    }
                    shape="square"
                    size={80}
                    src={logoPreview ?? undefined}
                />
                <div className="flex flex-wrap gap-2">
                    <Upload
                        accept="image/jpeg,image/png,image/webp"
                        beforeUpload={(files) => {
                            const file = files?.[0]
                            if (!file) return true
                            if (
                                ![
                                    'image/jpeg',
                                    'image/png',
                                    'image/webp',
                                ].includes(file.type)
                            ) {
                                return 'فقط فایل JPEG، PNG یا WebP مجاز است.'
                            }
                            return file.size <= 2 * 1024 * 1024
                                ? true
                                : 'حجم لوگو باید حداکثر ۲ مگابایت باشد.'
                        }}
                        showList={false}
                        uploadLimit={1}
                        onChange={(files) => {
                            const file = files.at(-1)
                            if (file) onChange(file)
                        }}
                    >
                        <Button type="button">انتخاب لوگو</Button>
                    </Upload>
                    {logoPreview && (
                        <Button
                            icon={
                                <TrashIcon
                                    aria-hidden="true"
                                    focusable="false"
                                    height={18}
                                    width={18}
                                />
                            }
                            type="button"
                            variant="plain"
                            onClick={onRemove}
                        >
                            حذف
                        </Button>
                    )}
                </div>
            </div>
            {error && <p className="mt-3 font-semibold text-error">{error}</p>}
        </Card>
    )
}
