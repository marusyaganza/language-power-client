import { useMantineColorScheme } from "@mantine/core";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/errors";
import { getAuthConfig, getCurrentUser, login, logout, signup } from "./api";
import { clearDemoSession, markDemoSession } from "./lib/demoSession";
import type { AuthConfig } from "./schemas";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
  config: () => [...authKeys.all, "config"] as const,
};

/** Source of truth for "who is logged in". `data` is null when there's no session. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
  });
}

export function useAuthConfig() {
  return useQuery({
    queryKey: authKeys.config(),
    queryFn: ({ signal }) => getAuthConfig(signal),
    staleTime: Infinity, // server config doesn't change at runtime
  });
}

/** On the demo (accounts expire), remember the login so the login page can explain a later 401. */
function rememberDemoSession(queryClient: QueryClient) {
  // Both auth pages load the config, so it's cached by the time anyone logs in or signs up.
  if (queryClient.getQueryData<AuthConfig>(authKeys.config())?.account_ttl_hours != null) markDemoSession();
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      rememberDemoSession(queryClient);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // Signup may or may not start a session; let the next protected route ask the server.
      queryClient.removeQueries({ queryKey: authKeys.currentUser() });
      rememberDemoSession(queryClient);
    },
    onError: (error) => {
      // A 429 is either the per-IP limit or the day's accounts running out. Refetching the config
      // tells them apart: when the day is full, the page switches to "closed for today".
      if (isApiError(error) && error.status === 429) {
        queryClient.invalidateQueries({ queryKey: authKeys.config() });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearColorScheme } = useMantineColorScheme();
  return useMutation({
    mutationFn: logout,
    // Clear session data even if the request fails: a stale session can't be fixed client-side,
    // and the next user must not inherit it. Per-user settings (prefs:<id>) stay in localStorage.
    onSettled: () => {
      queryClient.clear();
      clearSessionStorage(); // in-progress game
      clearColorScheme(); // logged-out pages follow the system; login restores the user's theme
      clearDemoSession(); // left on purpose: the login page needs no "session ended" hint
    },
  });
}

function clearSessionStorage() {
  try {
    sessionStorage.clear();
  } catch {
    // Storage can be unavailable (e.g. blocked by the browser); nothing to clear then.
  }
}
