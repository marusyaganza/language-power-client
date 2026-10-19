// A copy of the running game in sessionStorage so a reload resumes it. Keyed by game id only:
// the games list clears it when it opens, so a card click always starts a fresh session.
// What is stored is up to each game's player, which passes the schema to read it back with.
import type { z } from "zod";

const PREFIX = "game:";

/** The stored game, or null if there is none or it's unreadable (e.g. written by an older version). */
export function loadStoredGame<T>(gameId: number, schema: z.ZodType<T>): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + gameId);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveStoredGame(gameId: number, game: unknown): void {
  try {
    sessionStorage.setItem(PREFIX + gameId, JSON.stringify(game));
  } catch {
    // Storage unavailable or full: the game still works, it just won't survive a reload.
  }
}

export function clearStoredGame(gameId: number): void {
  try {
    sessionStorage.removeItem(PREFIX + gameId);
  } catch {
    // nothing to clear
  }
}

export function clearStoredGames(): void {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // nothing to clear
  }
}
