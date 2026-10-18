import { describe, expect, it } from "vitest";
import type { Game } from "../schemas";
import { formatTimeUntil, getGameAvailability, lockedMessage, nextUnlockTime } from "./gameAvailability";

const game = (counts: Partial<Game>): Game => ({
  id: 2,
  slug: "lexi-sense",
  title: "LexiSense",
  description: "",
  game_type: "select_def",
  total_word_count: 10,
  due_word_count: 3,
  next_due_at: null,
  min_word_count: 4,
  ...counts,
});

const NOW = Date.parse("2026-10-18T12:00:00Z");

describe("getGameAvailability", () => {
  it("is playable with enough words, and due words in spaced mode", () => {
    expect(getGameAvailability(game({}), "spaced")).toEqual({ playable: true });
    expect(getGameAvailability(game({}), "review")).toEqual({ playable: true });
  });

  it.each(["spaced", "review"] as const)("needs more words below the minimum in %s mode", (mode) => {
    expect(getGameAvailability(game({ total_word_count: 1, due_word_count: 1 }), mode)).toEqual({
      playable: false,
      reason: "needs-words",
      missingWords: 3,
    });
  });

  it("is locked in spaced mode when nothing is due, but playable in review", () => {
    const g = game({ due_word_count: 0, next_due_at: "2026-10-18T14:00:00Z" });
    expect(getGameAvailability(g, "spaced")).toEqual({
      playable: false,
      reason: "nothing-due",
      nextDueAt: new Date("2026-10-18T14:00:00Z"),
    });
    expect(getGameAvailability(g, "review")).toEqual({ playable: true });
  });

  it("reports the minimum before anything about due words", () => {
    expect(getGameAvailability(game({ total_word_count: 0, due_word_count: 0 }), "spaced")).toMatchObject({
      reason: "needs-words",
      missingWords: 4,
    });
  });
});

describe("formatTimeUntil", () => {
  it.each([
    [30 * 1000, "1m"],
    [45 * 60 * 1000, "45m"],
    [90 * 60 * 1000, "2h"],
    [26 * 3600 * 1000, "26h"],
    [3 * 24 * 3600 * 1000, "3d"],
  ])("formats %i ms ahead as %s", (ms, expected) => {
    expect(formatTimeUntil(new Date(NOW + ms), NOW)).toBe(expected);
  });

  it("returns null once the time has passed", () => {
    expect(formatTimeUntil(new Date(NOW), NOW)).toBeNull();
    expect(formatTimeUntil(new Date(NOW - 1000), NOW)).toBeNull();
  });
});

describe("lockedMessage", () => {
  it("counts missing words", () => {
    expect(lockedMessage({ playable: false, reason: "needs-words", missingWords: 3 }, NOW)).toBe(
      "Add 3 more words to unlock",
    );
    expect(lockedMessage({ playable: false, reason: "needs-words", missingWords: 1 }, NOW)).toBe(
      "Add 1 more word to unlock",
    );
  });

  it("says when the next word is due", () => {
    const nextDueAt = new Date(NOW + 2 * 3600 * 1000);
    expect(lockedMessage({ playable: false, reason: "nothing-due", nextDueAt }, NOW)).toBe("Next word due in 2h");
    expect(lockedMessage({ playable: false, reason: "nothing-due", nextDueAt: new Date(NOW - 1) }, NOW)).toBe(
      "Next word due any moment",
    );
    expect(lockedMessage({ playable: false, reason: "nothing-due", nextDueAt: null }, NOW)).toBe(
      "Nothing due right now",
    );
  });
});

describe("nextUnlockTime", () => {
  it("picks the earliest due time among games locked only by nothing being due", () => {
    const games = [
      game({ id: 1, due_word_count: 0, next_due_at: "2026-10-18T15:00:00Z" }),
      game({ id: 2, due_word_count: 0, next_due_at: "2026-10-18T13:00:00Z" }),
      game({ id: 3, due_word_count: 2, next_due_at: "2026-10-18T12:30:00Z" }), // already playable
      game({ id: 4, total_word_count: 1, due_word_count: 0, next_due_at: "2026-10-18T12:10:00Z" }), // needs words
      game({ id: 5, due_word_count: 0, next_due_at: null }),
    ];
    expect(nextUnlockTime(games)).toBe(Date.parse("2026-10-18T13:00:00Z"));
  });

  it("is null when nothing will unlock by itself", () => {
    expect(nextUnlockTime([game({}), game({ due_word_count: 0, next_due_at: null })])).toBeNull();
  });
});
