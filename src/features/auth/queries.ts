import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/language";
import { getAuthConfig, getCurrentUser, login, logout, signup } from "./api";

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

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
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
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { resetLanguage } = useLanguage();
  return useMutation({
    mutationFn: logout,
    // Clear everything even if the request fails: a stale session can't be fixed client-side,
    // and the next user must not inherit anything from the previous one.
    onSettled: () => {
      queryClient.clear();
      clearBrowserStorage(); // saved language, in-progress game, …
      resetLanguage();
    },
  });
}

function clearBrowserStorage() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Storage can be unavailable (e.g. blocked by the browser); nothing to clear then.
  }
}
