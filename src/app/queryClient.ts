import { MutationCache, QueryCache, QueryClient, type Mutation, type Query } from "@tanstack/react-query";
import { isApiError, shouldReport, shouldRetry } from "@/api/errors";
import { authKeys } from "@/features/auth";
import { reportError } from "./sentry";

/**
 * 401/403 may mean the session expired mid-use (the backend answers 403 "Not authenticated").
 * Instead of guessing, re-check /auth/me: if the session is gone RequireAuth sends the user to login.
 */
function onAuthError(error: Error) {
  if (isApiError(error) && (error.status === 401 || error.status === 403)) {
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
  }
}

// Failed requests are shown in the UI, so nothing else reports them.
function onQueryError(error: Error, query: Query<unknown, unknown, unknown>) {
  onAuthError(error);
  if (shouldReport(error)) reportError(error, { queryKey: query.queryKey });
}

function onMutationError(
  error: Error,
  _variables: unknown,
  _context: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>,
) {
  onAuthError(error);
  if (shouldReport(error)) reportError(error, { mutationKey: mutation.options.mutationKey });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onQueryError }),
  mutationCache: new MutationCache({ onError: onMutationError }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});
