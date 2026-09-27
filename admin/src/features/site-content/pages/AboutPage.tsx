import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useContentLanguages } from '@/features/blog'
import ListPageLayout, {
    ListPageContent,
} from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import { siteContentApi, siteKeys } from '../site-content.api'
import AboutForm from '../components/AboutForm'
import AboutGalleryDialog from '../components/AboutGalleryDialog'
export function AboutPage() {
    const client = useQueryClient()
    const query = useQuery({
        queryKey: siteKeys.about,
        queryFn: siteContentApi.about,
    })
    const { query: languages } = useContentLanguages()
    const [gallery, setGallery] = useState(false)
    const failed = [query, languages].find((q) => q.isError)
    return (
        <>
            <ListPageLayout
                title="درباره ما"
                subtitle="محتوا، تصاویر و SEO صفحه درباره ما"
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            disabled={!query.data}
                            onClick={() => setGallery(true)}
                        >
                            گالری تصاویر
                        </Button>
                    </div>
                }
            >
                {failed ? (
                    <QueryErrorState
                        error={failed.error}
                        title="دریافت اطلاعات ناموفق بود."
                        onRetry={() => void failed.refetch()}
                    />
                ) : !query.data || languages.isPending ? (
                    <Loading loading />
                ) : (
                    <ListPageContent>
                        <AboutForm
                            page={query.data}
                            onSaved={() =>
                                void client.invalidateQueries({
                                    queryKey: siteKeys.about,
                                })
                            }
                        />
                    </ListPageContent>
                )}
            </ListPageLayout>
            {gallery && (
                <AboutGalleryDialog onClose={() => setGallery(false)} />
            )}
        </>
    )
}
