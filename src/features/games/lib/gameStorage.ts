// A copy of the running game in sessionStorage so a reload resumes it. Keyed by game id only:
// the games list clears it when it opens, so a card click always starts a fresh session.
import { z } from "zod";
import { gameSessionSchema } from "../schemas";
import { gameProgressSchema } from "./gameReducer";

const PREFIX = "game:";

const storedGameSchema = z.object({
  session: gameSessionSchema,
  progress: gameProgressSchema,
});
export type StoredGame = z.infer<typeof storedGameSchema>;

/** The stored game, or null if there is none or it's unreadable (e.g. written by an older version). */
export function loadStoredGame(gameId: number): StoredGame | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + gameId);
    if (!raw) return null;
    const parsed = storedGameSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveStoredGame(gameId: number, game: StoredGame): void {
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
