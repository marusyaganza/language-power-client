import { useQuery } from "@tanstack/react-query";
import { getGames } from "./api";

export const gameKeys = {
  all: ["games"] as const,
  list: (language: string) => [...gameKeys.all, "list", { language }] as const,
};

export function useGames(language: string) {
  return useQuery({
    queryKey: gameKeys.list(language),
    queryFn: ({ signal }) => getGames(language, signal),
  });
}
