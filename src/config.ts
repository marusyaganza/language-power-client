// The only module that reads import.meta.env. Fails at startup if a variable is missing.

export interface AppConfig {
  apiBaseUrl: string;
}

export function readConfig(env: Partial<ImportMetaEnv>): AppConfig {
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL. Set it in .env (e.g. http://localhost:8000).");
  }
  return { apiBaseUrl: apiBaseUrl.replace(/\/+$/, "") };
}

export const config = readConfig(import.meta.env);
