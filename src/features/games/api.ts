import { apiFetch } from "@/api/http";
import type { GameOptions } from "./lib/gameOptions";
import {
  answerResponseSchema,
  gameResultSchema,
  gameSessionSchema,
  gamesSchema,
  type AnswerRequest,
} from "./schemas";

export function getGames(language: string, signal?: AbortSignal) {
  return apiFetch("/games", { query: { language }, schema: gamesSchema, signal });
}

/** Starts a new session on the backend; every call creates one. */
export function startGame(gameId: number, language: string, options: GameOptions) {
  return apiFetch(`/games/${gameId}`, {
    query: { language, mode: options.mode, new_words_first: options.newWordsFirst },
    schema: gameSessionSchema,
  });
}

export function submitAnswer(gameId: number, answer: AnswerRequest) {
  return apiFetch(`/games/${gameId}/answer`, { method: "POST", body: answer, schema: answerResponseSchema });
}

/** Finishes the session if it's still running (unanswered questions count as such) and returns the result. */
export function finishGame(sessionId: string) {
  return apiFetch(`/games/result/${sessionId}`, { schema: gameResultSchema });
}
