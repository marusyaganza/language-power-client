// src/api/games.ts — game session calls; moved into features/games in phase 6b.
import type { GameOptions } from "@/features/games";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchGameSession(gameId: string, language: string, { mode, newWordsFirst }: GameOptions) {
    const params = new URLSearchParams({ language, mode, new_words_first: String(newWordsFirst) })
    const res = await fetch(`${API_BASE}/games/${gameId}?${params}`, {
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load game')
    return res.json()
}

export async function submitAnswer(gameId: string, { sessionId, wordId, answer }: {sessionId: string, wordId: string, answer: string}) {
    const res = await fetch(`${API_BASE}/games/${gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId, word_id: wordId, answer }),
    })
    if (!res.ok) throw new Error('Failed to submit answer')
    return res.json()
}

export async function fetchGameResult(sessionId: string) {
    const res = await fetch(`${API_BASE}/games/result/${sessionId}`, {
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to load results')
    return res.json()
}