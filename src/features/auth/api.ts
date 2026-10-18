import { apiFetch } from "@/api/http";
import { isApiError } from "@/api/errors";
import { authConfigSchema, userSchema, type Credentials, type User } from "./schemas";

/** The logged-in user, or null when there's no valid session (the backend answers 401/403). */
export async function getCurrentUser(signal?: AbortSignal): Promise<User | null> {
  try {
    return await apiFetch("/auth/me", { schema: userSchema, signal });
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
}

export function getAuthConfig(signal?: AbortSignal) {
  return apiFetch("/auth/config", { schema: authConfigSchema, signal });
}

export function login(credentials: Credentials) {
  return apiFetch("/auth/login", { method: "POST", body: credentials, schema: userSchema });
}

export function signup(credentials: Credentials) {
  return apiFetch("/auth/signup", { method: "POST", body: credentials, schema: userSchema });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST", schema: null });
}
