export type MediaAsset = {
    id: string
    kind: 'IMAGE' | 'VIDEO'
    source: 'UPLOAD' | 'EXTERNAL'
    path: string | null
    externalUrl: string | null
    originalFileName: string | null
    processingStatus: 'PENDING' | 'READY' | 'FAILED'
    variants: Array<{ kind: string; path: string; width: number; height: number }>
    translations: Array<{ languageId: string; title: string | null; altText: string | null; caption: string | null }>
}
