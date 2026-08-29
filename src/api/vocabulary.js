const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchVocabulary({ query, page, sortBy, language }) {
    const params = new URLSearchParams({ page: String(page), sort_by: sortBy, language })
    if (query) params.set('query', query)

    const res = await fetch(`${BASE_URL}/words/vocabulary?${params}`, {
        credentials: 'include',
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return res.json()
}