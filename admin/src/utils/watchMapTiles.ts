import type { Map as LeafletMap } from 'leaflet'

/** Evaluate visible raster tiles together, not individual request failures. */
export default function watchMapTiles(
    map: LeafletMap,
    onUnavailable: (unavailable: boolean) => void,
) {
    const container = map.getContainer()
    let frame: number | undefined
    let disposed = false
    const check = () => {
        frame = undefined
        if (disposed) return
        const bounds = container.getBoundingClientRect()
        const tiles = Array.from(
            container.querySelectorAll<HTMLImageElement>('img.leaflet-tile'),
        ).filter((tile) => {
            const rect = tile.getBoundingClientRect()
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.right > bounds.left &&
                rect.left < bounds.right &&
                rect.bottom > bounds.top &&
                rect.top < bounds.bottom
            )
        })
        if (!tiles.length || tiles.some((tile) => !tile.complete)) {
            onUnavailable(false)
            return
        }
        onUnavailable(
            !tiles.some(
                (tile) => tile.naturalWidth > 0 && tile.naturalHeight > 0,
            ),
        )
    }
    const schedule = () => {
        if (!disposed && frame === undefined)
            frame = requestAnimationFrame(check)
    }
    container.addEventListener('load', schedule, true)
    container.addEventListener('error', schedule, true)
    map.on('moveend zoomend resize', schedule)
    const observer = new MutationObserver(schedule)
    observer.observe(container, { childList: true, subtree: true })
    schedule()
    return () => {
        disposed = true
        if (frame !== undefined) cancelAnimationFrame(frame)
        observer.disconnect()
        container.removeEventListener('load', schedule, true)
        container.removeEventListener('error', schedule, true)
        map.off('moveend zoomend resize', schedule)
    }
}
