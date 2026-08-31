// src/hooks/useGames.ts
import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "@/api/games";

export function useGames(language: string) {
  return useQuery({
    queryKey: ["games", language],
    queryFn: () => fetchGames(language),
    enabled: Boolean(language),
  });
}