import { useEffect, useRef, useState } from 'react'
import type {
    CircleMarker,
    LeafletMouseEvent,
    Map as LeafletMap,
    MapOptions,
} from 'leaflet'
import '@neshan-maps-platform/leaflet/dist/leaflet.css'

type Coordinates = { latitude: number; longitude: number }

type NeshanLeaflet = typeof import('leaflet') & {
    Map: new (
        element: HTMLElement,
        options: MapOptions & { key: string; maptype: 'dreamy' },
    ) => LeafletMap
}

export default function MapLocationPicker({
    value,
    onChange,
}: {
    value: Coordinates | null
    onChange: (value: Coordinates) => void
}) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<LeafletMap | null>(null)
    const markerRef = useRef<CircleMarker | null>(null)
    const onChangeRef = useRef(onChange)
    const valueRef = useRef(value)
    const [mapError, setMapError] = useState<string | null>(null)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        valueRef.current = value
        const map = mapRef.current
        if (!map) return
        if (!value) {
            markerRef.current?.remove()
            markerRef.current = null
            return
        }
        map.setView([value.latitude, value.longitude], map.getZoom())
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
        void import('@neshan-maps-platform/leaflet')
            .then((module) => {
                if (disposed) return
                const L = module.default as NeshanLeaflet
                const currentValue = valueRef.current
                localMap = new L.Map(element, {
                    center: currentValue
                        ? [currentValue.latitude, currentValue.longitude]
                        : [35.6892, 51.389],
                    key,
                    maptype: 'dreamy',
                    scrollWheelZoom: true,
                    zoom: currentValue ? 15 : 11,
                })
                localMap.attributionControl.setPrefix(false)
                mapRef.current = localMap
                if (currentValue) {
                    markerRef.current = L.circleMarker(
                        [currentValue.latitude, currentValue.longitude],
                        {
                            color: '#2563eb',
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            radius: 8,
                        },
                    ).addTo(localMap)
                }
                localMap.on('click', (event: LeafletMouseEvent) => {
                    if (markerRef.current) {
                        markerRef.current.setLatLng(event.latlng)
                    } else {
                        markerRef.current = L.circleMarker(event.latlng, {
                            color: '#2563eb',
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            radius: 8,
                        }).addTo(localMap!)
                    }
                    onChangeRef.current({
                        latitude: Number(event.latlng.lat.toFixed(7)),
                        longitude: Number(event.latlng.lng.toFixed(7)),
                    })
                })
            })
            .catch(() => {
                if (!disposed) setMapError('نمایش نقشه نشان انجام نشد.')
            })
        return () => {
            disposed = true
            markerRef.current = null
            mapRef.current = null
            localMap?.remove()
        }
    }, [])

    return (
        <div className="space-y-2">
            {mapError ? <p className="text-sm text-error">{mapError}</p> : null}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="h-72 w-full" ref={containerRef} />
            </div>
        </div>
    )
}
