import { useQuery } from "@tanstack/react-query";
import { fetchAuthConfig } from "../api/auth";

export function useAuthConfig() {
  return useQuery({
    queryKey: ["authConfig"],
    queryFn: fetchAuthConfig,
    staleTime: Infinity, // this won't change at runtime, no need to refetch often
  });
}