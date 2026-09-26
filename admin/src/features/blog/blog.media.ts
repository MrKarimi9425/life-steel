import type { MediaAsset } from '@/features/media'
import type { ArticleDetail } from './blog.types'

export function articleMediaAssets(article?: ArticleDetail): MediaAsset[] {
    return (article?.media ?? []).map(({ media }) => ({
        ...media,
        source: 'UPLOAD',
        externalUrl: null,
        originalFileName: null,
        processingStatus: 'READY',
    }))
}
