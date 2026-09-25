import type { ReactNode } from 'react'
import type { Language } from '@/features/languages'

interface LanguageTabsProps {
    languages: Language[]
    activeId: string
    onChange: (id: string) => void
    children: ReactNode
}

export function LanguageTabs({ languages, activeId, onChange, children }: LanguageTabsProps) {
    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
                {languages.map((language) => (
                    <button
                        key={language.id}
                        type="button"
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeId === language.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => onChange(language.id)}
                    >
                        {language.nativeName}
                        {language.isRequiredForPublish && ' *'}
                    </button>
                ))}
            </div>
            {children}
        </div>
    )
}
