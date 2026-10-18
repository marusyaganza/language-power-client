import { describe, expect, it } from "vitest";
import { gameOptionsToParams, gamePath, parseGameOptions } from "./gameOptions";

const parse = (search: string) => parseGameOptions(new URLSearchParams(search));

describe("parseGameOptions", () => {
  it("defaults to spaced repetition without new words first", () => {
    expect(parse("")).toEqual({ mode: "spaced", newWordsFirst: false });
  });

  it("reads review mode and new words first", () => {
    expect(parse("?mode=review&new_words_first=true")).toEqual({ mode: "review", newWordsFirst: true });
  });

  it("ignores invalid values", () => {
    expect(parse("?mode=hard&new_words_first=yes")).toEqual({ mode: "spaced", newWordsFirst: false });
  });
});

describe("gameOptionsToParams / gamePath", () => {
  it("leaves defaults out", () => {
    expect(gameOptionsToParams({ mode: "spaced", newWordsFirst: false }).toString()).toBe("");
    expect(gamePath(3, { mode: "spaced", newWordsFirst: false })).toBe("/games/3");
  });

  it("uses the backend's param names", () => {
    expect(gamePath(3, { mode: "review", newWordsFirst: true })).toBe("/games/3?mode=review&new_words_first=true");
  });

  it("round-trips", () => {
    const options = { mode: "review", newWordsFirst: true } as const;
    expect(parseGameOptions(gameOptionsToParams(options))).toEqual(options);
  });
});
