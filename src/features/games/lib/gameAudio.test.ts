import { describe, expect, it } from "vitest";
import { autoPlayUrl } from "./gameAudio";

const url = "https://audio.test/hola.mp3";

describe("autoPlayUrl", () => {
  it("plays from the start for `start` games, before and after answering", () => {
    expect(autoPlayUrl({ moment: "start", answered: false, muted: false, audioUrl: url })).toBe(url);
    expect(autoPlayUrl({ moment: "start", answered: true, muted: false, audioUrl: url })).toBe(url);
  });

  it("waits for the answer in `feedback` games", () => {
    expect(autoPlayUrl({ moment: "feedback", answered: false, muted: false, audioUrl: url })).toBeNull();
    expect(autoPlayUrl({ moment: "feedback", answered: true, muted: false, audioUrl: url })).toBe(url);
  });

  it("plays nothing when muted or without audio", () => {
    expect(autoPlayUrl({ moment: "start", answered: false, muted: true, audioUrl: url })).toBeNull();
    expect(autoPlayUrl({ moment: "feedback", answered: true, muted: false, audioUrl: null })).toBeNull();
  });
});
