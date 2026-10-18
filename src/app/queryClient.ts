import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/errors";
import { authKeys } from "@/features/auth";

/** 4xx answers won't change by retrying; network/5xx errors get two more attempts. */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (isApiError(error) && error.status !== null && error.status < 500) return false;
  return failureCount < 2;
}

/**
 * 401/403 may mean the session expired mid-use (the backend answers 403 "Not authenticated").
 * Instead of guessing, re-check /auth/me: if the session is gone RequireAuth sends the user to login.
 */
function onAuthError(error: Error) {
  if (isApiError(error) && (error.status === 401 || error.status === 403)) {
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onAuthError }),
  mutationCache: new MutationCache({ onError: onAuthError }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});
