import { describe, expect, it } from "vitest";
import { formatSignupReopen, nextUtcMidnight } from "./signupReopen";

describe("nextUtcMidnight", () => {
  it("is the start of the next UTC day", () => {
    expect(nextUtcMidnight(new Date("2026-10-28T15:30:00Z"))).toEqual(new Date("2026-10-29T00:00:00Z"));
  });

  it("moves a full day at exactly midnight", () => {
    expect(nextUtcMidnight(new Date("2026-10-28T00:00:00Z"))).toEqual(new Date("2026-10-29T00:00:00Z"));
  });

  it("crosses month and year ends", () => {
    expect(nextUtcMidnight(new Date("2026-12-31T23:59:59Z"))).toEqual(new Date("2027-01-01T00:00:00Z"));
  });
});

describe("formatSignupReopen", () => {
  const now = new Date("2026-10-28T15:30:00Z");

  it("says tomorrow east of UTC", () => {
    expect(formatSignupReopen(now, { locale: "en-US", timeZone: "Europe/Berlin" })).toBe("tomorrow at 1:00 AM");
  });

  it("says today west of UTC", () => {
    expect(formatSignupReopen(now, { locale: "en-US", timeZone: "America/New_York" })).toBe("today at 8:00 PM");
  });

  it("says tomorrow in UTC", () => {
    expect(formatSignupReopen(now, { locale: "en-GB", timeZone: "UTC" })).toBe("tomorrow at 0:00");
  });
});
