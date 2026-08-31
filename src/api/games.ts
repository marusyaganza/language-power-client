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