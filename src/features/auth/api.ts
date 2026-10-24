import { apiFetch } from "@/api/http";
import { ApiError, isApiError } from "@/api/errors";
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

/**
 * Wrong credentials are a 401, a password over the 72-byte limit a 422. Both get one message,
 * so the login form doesn't reveal the signup rules.
 */
export async function login(credentials: Credentials) {
  try {
    return await apiFetch("/auth/login", { method: "POST", body: credentials, schema: userSchema });
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 422)) {
      throw new ApiError("http", "Incorrect email or password", error.status, error.details);
    }
    throw error;
  }
}

export function signup(credentials: Credentials) {
  return apiFetch("/auth/signup", { method: "POST", body: credentials, schema: userSchema });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST", schema: null });
}
