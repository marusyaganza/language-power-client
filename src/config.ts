// The only module that reads import.meta.env. Everything here is optional: the app runs without it.

export interface AppConfig {
  /** Error reporting is off when there is no DSN (local dev, tests, forks). */
  sentryDsn: string | undefined;
  sentryEnvironment: string;
}

export function readConfig(env: Partial<ImportMetaEnv>): AppConfig {
  return {
    sentryDsn: env.VITE_SENTRY_DSN?.trim() || undefined,
    sentryEnvironment: env.VITE_SENTRY_ENVIRONMENT?.trim() || "production",
  };
}

export const config = readConfig(import.meta.env);
