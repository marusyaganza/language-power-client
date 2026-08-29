// src/api/words.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function saveWord(word) {
    const res = await fetch(`${BASE_URL}/words/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(word),
    })

    if (!res.ok) {
        if (res.status === 409) {
            const error = new Error('Word already saved')
            error.status = 409
            throw error
        }
        throw new Error('Failed to save word')
    }

    return res.json()
}

export async function deleteWord(wordId) {
    const res = await fetch(`${BASE_URL}/words/${wordId}`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) {
        if (res.status === 404) {
            const error = new Error('Word not found')
            error.status = 404
            throw error
        }
        throw new Error('Failed to delete word')
    }
    // 204 has no body — don't call res.json()
}