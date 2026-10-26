import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { config } from "@/config";

/**
 * Error reporting only: no performance tracing and no session replay, which are the parts of Sentry
 * that cost bundle size, CPU and requests on every page. A request goes out only when an error is sent.
 * Without a DSN (local dev, tests) the SDK isn't started and every call below does nothing.
 */
export function initSentry() {
  if (!config.sentryDsn) return;

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    // Same-origin route that Netlify forwards to Sentry (rule generated in vite.config.js), so ad blockers don't drop events.
    tunnel: "/sentry",
    // Only errors from our own scripts, not from browser extensions or injected code.
    allowUrls: [window.location.origin],
    ignoreErrors: [
      // Harmless browser warning that some layouts trigger; not a bug.
      /ResizeObserver loop/,
    ],
  });
}

/** For React 19's root error options: errors no error boundary caught. */
export const reactErrorHandler = Sentry.reactErrorHandler;

export function reportError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, context && { contexts: { app: context } });
}

/** Tags reports with the logged-in user's id (never the email); cleared when the user logs out. */
export function useErrorReportingUser(userId: number | undefined) {
  useEffect(() => {
    if (userId === undefined) return;
    Sentry.setUser({ id: userId });
    return () => Sentry.setUser(null);
  }, [userId]);
}
