import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameOptions } from "./lib/gameOptions";
import { finishGame, getGames, startGame, submitAnswer } from "./api";
import type { AnswerRequest } from "./schemas";

export const gameKeys = {
  all: ["games"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  list: (language: string) => [...gameKeys.lists(), { language }] as const,
  session: (gameId: number, language: string, options: GameOptions) =>
    [...gameKeys.all, "session", { gameId, language, ...options }] as const,
};

export function useGames(language: string) {
  return useQuery({
    queryKey: gameKeys.list(language),
    queryFn: ({ signal }) => getGames(language, signal),
  });
}

/**
 * Starts a session when the game page mounts. Starting one is a side effect on the backend,
 * so it's fetched once per visit: never refetched in the background, never retried, and dropped
 * from the cache as soon as the page unmounts so the next visit starts a fresh session.
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

export function useSubmitAnswer(gameId: number) {
  return useMutation({
    mutationFn: (answer: AnswerRequest) => submitAnswer(gameId, answer),
  });
}

export function useFinishGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: finishGame,
    onSuccess: () => {
      // Due counts changed; the games list should show them when the user goes back.
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}
