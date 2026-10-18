import { apiFetch } from "@/api/http";
import { gamesSchema } from "./schemas";

export function getGames(language: string, signal?: AbortSignal) {
  return apiFetch("/games", { query: { language }, schema: gamesSchema, signal });
}
