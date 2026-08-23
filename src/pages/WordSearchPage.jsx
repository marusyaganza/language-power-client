// src/pages/WordSearchPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8000' // move to an env var later

async function searchWord(query, language) {
    const res = await fetch(
        `${API_BASE}/word/search?query=${encodeURIComponent(query)}&language=${language}`
    )
    if (!res.ok) {
        if (res.status === 404) return []
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export default function WordSearchPage() {
    const [query, setQuery] = useState('')
    const [language, setLanguage] = useState('es')
    const [submittedQuery, setSubmittedQuery] = useState(null)

    const { data: results, isLoading, isError, error } = useQuery({
        queryKey: ['wordSearch', submittedQuery, language],
        queryFn: () => searchWord(submittedQuery, language),
        enabled: !!submittedQuery, // don't fetch until a search is actually submitted
    })

    function handleSubmit(e) {
        e.preventDefault()
        setSubmittedQuery(query.trim())
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a word..."
                />
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="es">Spanish</option>
                    <option value="en">English</option>
                </select>
                <button type="submit">Search</button>
            </form>

            {isLoading && <p>Loading...</p>}
            {isError && <p>Error: {error.message}</p>}
            {results && results.length === 0 && submittedQuery && <p>No results found.</p>}

            <ul>
                {results?.map((word) => (
                    <li key={word.uuid}>
                        <strong>{word.name}</strong> {word.fl && <em>({word.fl})</em>}
                        <ul>
                            {word.defs.map((def, i) => (
                                <li key={i}>{def}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}