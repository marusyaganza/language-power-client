import { describe, expect, it } from "vitest";
import { readConfig } from "./config";

describe("readConfig", () => {
  it("reads the Sentry settings", () => {
    expect(
      readConfig({ VITE_SENTRY_DSN: " https://key@o1.ingest.us.sentry.io/2 ", VITE_SENTRY_ENVIRONMENT: "deploy-preview" }),
    ).toEqual({ sentryDsn: "https://key@o1.ingest.us.sentry.io/2", sentryEnvironment: "deploy-preview" });
  });

  it.each([undefined, "", "   "])("turns error reporting off when the DSN is %j", (value) => {
    expect(readConfig({ VITE_SENTRY_DSN: value })).toEqual({ sentryDsn: undefined, sentryEnvironment: "production" });
  });
});
