// Whether a game can be started in a mode, and if not, what the card should tell the user.
import type { Game, GameMode } from "../schemas";

export type GameAvailability =
  | { playable: true }
  /** The backend refuses to start with fewer than `min_word_count` words, in any mode. */
  | { playable: false; reason: "needs-words"; missingWords: number }
  /** Spaced repetition only plays due words. */
  | { playable: false; reason: "nothing-due"; nextDueAt: Date | null };

export function getGameAvailability(game: Game, mode: GameMode): GameAvailability {
  if (game.total_word_count < game.min_word_count) {
    return { playable: false, reason: "needs-words", missingWords: game.min_word_count - game.total_word_count };
  }
  if (mode === "spaced" && game.due_word_count === 0) {
    return { playable: false, reason: "nothing-due", nextDueAt: game.next_due_at ? new Date(game.next_due_at) : null };
  }
  return { playable: true };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Compact time until `target`: "5m", "2h", "3d"; null once it has passed. */
export function formatTimeUntil(target: Date, now: number): string | null {
  const ms = target.getTime() - now;
  if (ms <= 0) return null;
  if (ms < HOUR) return `${Math.ceil(ms / MINUTE)}m`;
  if (ms < 2 * DAY) return `${Math.round(ms / HOUR)}h`;
  return `${Math.round(ms / DAY)}d`;
}

/** The line a locked card shows. */
export function lockedMessage(availability: Exclude<GameAvailability, { playable: true }>, now: number): string {
  if (availability.reason === "needs-words") {
    const n = availability.missingWords;
    return `Add ${n} more ${n === 1 ? "word" : "words"} to unlock`;
  }
  if (!availability.nextDueAt) return "Nothing due right now";
  const wait = formatTimeUntil(availability.nextDueAt, now);
  return wait ? `Next word due in ${wait}` : "Next word due any moment";
}

/**
 * When the next game locked only by "nothing due" unlocks (ms), or null if none will.
 * The games list refetches at that moment so the card unlocks without a reload.
 */
export function nextUnlockTime(games: Game[]): number | null {
  const times = games
    .filter((g) => g.due_word_count === 0 && g.total_word_count >= g.min_word_count && g.next_due_at)
    .map((g) => Date.parse(g.next_due_at as string))
    .filter((t) => !Number.isNaN(t));
  return times.length > 0 ? Math.min(...times) : null;
}
