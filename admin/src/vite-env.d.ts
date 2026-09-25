/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly VITE_REQUEST_TIMEOUT_MS?: string
    readonly VITE_NESHAN_WEB_API_KEY?: string
}

declare module '@neshan-maps-platform/leaflet' {
    const neshanLeaflet: unknown
    export default neshanLeaflet
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
