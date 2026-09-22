// src/api/games.ts
import { Game } from "@/types/game";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface GameResponse {
  id: number;
  slug: string;
  title: string;
  description: string;
  game_type: string;
  available_word_count: number;
  is_enabled: boolean;
}

export async function fetchGames(language: string): Promise<Game[]> {
  const res = await fetch(`${API_BASE}/games?language=${language}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch games");
  const data: GameResponse[] = await res.json();
  return data.map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    description: g.description,
    gameType: g.game_type,
    availableWordCount: g.available_word_count,
    isEnabled: g.is_enabled,
  }));
}

export async function fetchGameSession(gameId: string, language: string) {
    const res = await fetch(`${API_BASE}/games/${gameId}?language=${language}`, {
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