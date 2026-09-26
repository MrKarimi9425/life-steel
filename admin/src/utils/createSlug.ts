/** Keep generated slugs compatible with the catalog API contract. */
export default function createSlug(title: string): string {
    return title
        .normalize('NFKC')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 180)
        .replace(/-+$/g, '')
}
