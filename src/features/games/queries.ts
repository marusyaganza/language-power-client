import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import type { GameOptions } from "./lib/gameOptions";
import {
  getGameResult,
  getGames,
  getGameSettings,
  getGameSettingsPresets,
  startGame,
  submitAnswer,
  updateGameSettings,
} from "./api";
import type { AnswerRequest } from "./schemas";

export const gameKeys = {
  all: ["games"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  list: (language: string) => [...gameKeys.lists(), { language }] as const,
  session: (gameId: number, language: string, options: GameOptions) =>
    [...gameKeys.all, "session", { gameId, language, ...options }] as const,
  settings: () => [...gameKeys.all, "settings"] as const,
  settingsPresets: () => [...gameKeys.settings(), "presets"] as const,
};

export function useGames(language: string) {
  return useQuery({
    queryKey: gameKeys.list(language),
    queryFn: ({ signal }) => getGames(language, signal),
  });
}

/**
 * Starts a session when the game page mounts. It's a POST that creates a session, but a query rather
 * than a mutation because the page renders from its result. Every call creates another session, so it
 * runs once per visit: never refetched in the background, never retried, and dropped from the cache as
 * soon as the page unmounts so the next visit starts a fresh session.
 * The request is deliberately not abortable: if it were, React's dev double-mount would cancel
 * it on the brief unmount and send a second one, creating two sessions.
 * `schema` is the session format of this game's type.
 */
export function useStartGame<T>(
  gameId: number,
  language: string,
  options: GameOptions,
  schema: z.ZodType<T>,
  enabled: boolean,
) {
  return useQuery({
    queryKey: gameKeys.session(gameId, language, options),
    queryFn: () => startGame(gameId, language, options, schema),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ sessionId, ...answer }: AnswerRequest & { sessionId: string }) => submitAnswer(sessionId, answer),
  });
}

/** Ends the session (if still running) and returns its result. Safe to repeat: the backend returns the same result. */
export function useGameResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getGameResult,
    onSuccess: () => {
      // Due counts changed; the games list should show them when the user goes back.
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/** The logged-in user's spaced-repetition settings. `enabled` defers loading until they're shown. */
export function useGameSettings(enabled: boolean) {
  return useQuery({
    queryKey: gameKeys.settings(),
    queryFn: ({ signal }) => getGameSettings(signal),
    enabled,
  });
}

export function useGameSettingsPresets(enabled: boolean) {
  return useQuery({
    queryKey: gameKeys.settingsPresets(),
    queryFn: ({ signal }) => getGameSettingsPresets(signal),
    enabled,
    staleTime: Infinity, // fixed on the backend
  });
}

export function useUpdateGameSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGameSettings,
    onSuccess: (settings) => {
      // Saved settings never move scheduled reviews, so the games list stays valid.
      queryClient.setQueryData(gameKeys.settings(), settings);
      notifications.show({ message: "Settings saved", color: "green" });
    },
    onError: (error) => {
      notifications.show({ title: "Couldn't save settings", message: error.message, color: "red" });
    },
  });
}
