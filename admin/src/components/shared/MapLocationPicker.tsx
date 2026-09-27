import { useEffect, useRef, useState } from 'react'
import type {
    CircleMarker,
    LeafletMouseEvent,
    Map as LeafletMap,
    MapOptions,
} from 'leaflet'
import '@neshan-maps-platform/leaflet/dist/leaflet.css'
import watchMapTiles from '@/utils/watchMapTiles'

export type MapCoordinates = { latitude: number; longitude: number }
type NeshanLeaflet = typeof import('leaflet') & {
    Map: new (
        element: HTMLElement,
        options: MapOptions & { key: string; maptype: 'dreamy' },
    ) => LeafletMap
}

export default function MapLocationPicker({
    value,
    onChange,
    disabled = false,
}: {
    value: MapCoordinates | null
    onChange: (value: MapCoordinates) => void
    disabled?: boolean
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<LeafletMap | null>(null)
    const markerRef = useRef<CircleMarker | null>(null)
    const onChangeRef = useRef(onChange)
    const valueRef = useRef(value)
    const disabledRef = useRef(disabled)
    const [mapError, setMapError] = useState<string | null>(null)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])
    useEffect(() => {
        disabledRef.current = disabled
    }, [disabled])
    useEffect(() => {
        valueRef.current = value
        const map = mapRef.current
        if (!map) return
        if (!value) {
            markerRef.current?.remove()
            markerRef.current = null
            return
        }
        map.panTo([value.latitude, value.longitude])
        markerRef.current?.setLatLng([value.latitude, value.longitude])
    }, [value])

    useEffect(() => {
        const element = containerRef.current
        const key = import.meta.env.VITE_NESHAN_WEB_API_KEY
        if (!element || !key) {
            setMapError('کلید نمایش نقشه نشان تنظیم نشده است.')
            return
        }
        let disposed = false
        let localMap: LeafletMap | null = null
        let observer: ResizeObserver | undefined
        let stopWatchingTiles: (() => void) | undefined
        void import('@neshan-maps-platform/leaflet')
            .then((module) => {
                if (disposed) return
                const L = module.default as NeshanLeaflet
                const current = valueRef.current
                localMap = new L.Map(element, {
                    center: current
                        ? [current.latitude, current.longitude]
                        : [32, 53],
                    key,
                    maptype: 'dreamy',
                    scrollWheelZoom: true,
                    zoom: current ? 15 : 5,
                })
                localMap.attributionControl.setPrefix(false)
                mapRef.current = localMap
                const markerOptions = {
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    radius: 8,
                }
                if (current)
                    markerRef.current = L.circleMarker(
                        [current.latitude, current.longitude],
                        markerOptions,
                    ).addTo(localMap)
                localMap.on('click', (event: LeafletMouseEvent) => {
                    if (disabledRef.current || !localMap) return
                    const longitude =
                        ((((event.latlng.lng + 180) % 360) + 360) % 360) - 180
                    const point: [number, number] = [
                        event.latlng.lat,
                        longitude,
                    ]
                    if (markerRef.current) markerRef.current.setLatLng(point)
                    else
                        markerRef.current = L.circleMarker(
                            point,
                            markerOptions,
                        ).addTo(localMap)
                    onChangeRef.current({
                        latitude: Number(point[0].toFixed(7)),
                        longitude: Number(point[1].toFixed(7)),
                    })
                })
                stopWatchingTiles = watchMapTiles(localMap, (unavailable) => {
                    if (!disposed)
                        setMapError(
                            unavailable
                                ? 'تصاویر نقشه دریافت نشدند. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'
                                : null,
                        )
                })
                observer = new ResizeObserver(() => localMap?.invalidateSize())
                observer.observe(element)
            })
            .catch(() => {
                if (!disposed) setMapError('نمایش نقشه نشان انجام نشد.')
            })
        return () => {
            disposed = true
            observer?.disconnect()
            stopWatchingTiles?.()
            markerRef.current = null
            mapRef.current = null
            localMap?.remove()
        }
    }, [])

    return (
        <div className="space-y-2">
            {mapError && (
                <p role="alert" className="text-sm text-error">
                    {mapError}
                </p>
            )}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div
                    ref={containerRef}
                    className="h-80 w-full"
                    aria-label="انتخاب موقعیت روی نقشه"
                />
            </div>
        </div>
    )
}
