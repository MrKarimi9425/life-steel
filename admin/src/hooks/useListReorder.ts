import {
    useMutation,
    useQueryClient,
    type QueryKey,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/http/api-client'

type OrderedItem = { id: string }

export function useListReorder<TItem extends OrderedItem>(
    queryKey: QueryKey,
    endpoint: string,
) {
    const client = useQueryClient()

    return useMutation({
        mutationFn: (items: TItem[]) =>
            apiClient.put(endpoint, { ids: items.map((item) => item.id) }),
        onMutate: async (items) => {
            await client.cancelQueries({ queryKey })
            const previous = client.getQueryData<TItem[]>(queryKey)
            client.setQueryData(queryKey, items)
            return { previous }
        },
        onError: (_error, _items, context) => {
            if (context?.previous) {
                client.setQueryData(queryKey, context.previous)
            }
        },
        onSettled: () => client.invalidateQueries({ queryKey }),
    })
}
