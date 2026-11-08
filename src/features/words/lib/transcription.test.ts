import { describe, expect, it } from "vitest";
import { formatTranscription } from "./transcription";

describe("formatTranscription", () => {
  it("puts Korean pronunciation in brackets", () => {
    expect(formatTranscription("가ː게", "ko")).toBe("[가ː게]");
  });

  it("puts other transcriptions between slashes", () => {
    expect(formatTranscription("ˈwēl", "en")).toBe("/ˈwēl/");
  });
});
