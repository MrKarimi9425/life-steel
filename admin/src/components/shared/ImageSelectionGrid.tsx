type ImageOption = { id: string; src: string; label: string }

type Props = {
    images: ImageOption[]
    selectedId?: string | null
    selectedIds?: string[]
    selectedLabel?: string
    unselectedLabel?: string
    onSelect: (id: string) => void
}

export default function ImageSelectionGrid({
    images,
    selectedId,
    selectedIds,
    selectedLabel = 'انتخاب شده',
    unselectedLabel = 'انتخاب تصویر',
    onSelect,
}: Props) {
    return (
        <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            role="group"
            aria-label="انتخاب تصویر"
        >
            {images.map((image) => (
                <button
                    key={image.id}
                    type="button"
                    aria-label={image.label}
                    aria-pressed={
                        selectedIds
                            ? selectedIds.includes(image.id)
                            : selectedId === image.id
                    }
                    onClick={() => onSelect(image.id)}
                    className={`overflow-hidden rounded-xl border-2 p-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-primary ${(selectedIds ? selectedIds.includes(image.id) : selectedId === image.id) ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-primary dark:border-gray-600'}`}
                >
                    <img
                        src={image.src}
                        alt={image.label}
                        loading="lazy"
                        className="aspect-square w-full rounded-lg object-contain"
                    />
                    <span className="mt-2 block truncate text-sm">
                        {image.label}
                    </span>
                    <span className="mt-1 block text-xs text-primary">
                        {(
                            selectedIds
                                ? selectedIds.includes(image.id)
                                : selectedId === image.id
                        )
                            ? selectedLabel
                            : unselectedLabel}
                    </span>
                </button>
            ))}
        </div>
    )
}
