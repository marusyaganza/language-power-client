// How a game is played. Kept in the URL with the backend's own param names, on both the games list
// (/games?mode=review) and the game itself (/games/3?mode=review), which sends them to GET /games/{id}.
import type { GameMode } from "../schemas";

export interface GameOptions {
  mode: GameMode;
  newWordsFirst: boolean;
}

export const DEFAULT_GAME_OPTIONS: GameOptions = { mode: "spaced", newWordsFirst: false };

/** Reads the options from URL params; missing or invalid values fall back to defaults. */
export function parseGameOptions(params: URLSearchParams): GameOptions {
  return {
    mode: params.get("mode") === "review" ? "review" : "spaced",
    newWordsFirst: params.get("new_words_first") === "true",
  };
}

/** Writes the options to URL params, leaving out defaults. */
export function gameOptionsToParams(options: GameOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (options.mode !== DEFAULT_GAME_OPTIONS.mode) params.set("mode", options.mode);
  if (options.newWordsFirst) params.set("new_words_first", "true");
  return params;
}

/** Link to a game with these options, e.g. "/games/3?mode=review". */
export function gamePath(gameId: number, options: GameOptions): string {
  const search = gameOptionsToParams(options).toString();
  return `/games/${gameId}${search ? `?${search}` : ""}`;
}

/** The games list with these options, e.g. "/games?mode=review". */
export function gamesListPath(options: GameOptions): string {
  const search = gameOptionsToParams(options).toString();
  return `/games${search ? `?${search}` : ""}`;
}
