import type { z } from "zod";
import { apiFetch } from "@/api/http";
import type { GameOptions } from "./lib/gameOptions";
import {
  answerResponseSchema,
  gameResultSchema,
  gameSettingsPresetsSchema,
  gameSettingsSchema,
  gamesSchema,
  type AnswerRequest,
  type GameSessionCreate,
  type GameSettingsUpdate,
} from "./schemas";

export function getGames(language: string, signal?: AbortSignal) {
  return apiFetch("/games", { query: { language }, schema: gamesSchema, signal });
}

/** Starts a new session on the backend; every call creates one. Its format depends on the game, hence `schema`. */
export function startGame<T>(gameId: number, language: string, options: GameOptions, schema: z.ZodType<T>) {
  const body: GameSessionCreate = { language, mode: options.mode, new_words_first: options.newWordsFirst };
  return apiFetch(`/games/${gameId}/sessions`, { method: "POST", body, schema });
}

export function submitAnswer(sessionId: string, answer: AnswerRequest) {
  return apiFetch(`/games/sessions/${sessionId}/answers`, {
    method: "POST",
    body: answer,
    schema: answerResponseSchema,
  });
}

/**
 * Ends the session if it's still running (unanswered questions count as such) and returns the result.
 * Idempotent: asking again for a finished session returns the same result.
 */
export function getGameResult(sessionId: string) {
  return apiFetch(`/games/sessions/${sessionId}/result`, { method: "POST", schema: gameResultSchema });
}

export function getGameSettings(signal?: AbortSignal) {
  return apiFetch("/users/me/game-settings", { schema: gameSettingsSchema, signal });
}

export function updateGameSettings(settings: GameSettingsUpdate) {
  return apiFetch("/users/me/game-settings", { method: "PUT", body: settings, schema: gameSettingsSchema });
}

export function getGameSettingsPresets(signal?: AbortSignal) {
  return apiFetch("/users/me/game-settings/presets", { schema: gameSettingsPresetsSchema, signal });
}
