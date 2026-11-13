import { describe, expect, it } from "vitest";
import { canGenerateAudio, isGeneratedAudioUrl, MAX_AUDIO_TEXT_LENGTH } from "./audioGeneration";

const HASH = "a".repeat(64);
const BUCKET_URL = `https://storage.googleapis.com/py-lp-512416-media/audio/ko/google/${HASH}.mp3`;
const LOCAL_URL = `http://localhost:8000/media/audio/en/google/${HASH}.mp3`;
const DICTIONARY_URL = "https://media.merriam-webster.com/audio/prons/en/us/mp3/w/wheel001.mp3";

describe("isGeneratedAudioUrl", () => {
  it("recognizes the server's generated files, in the bucket and locally", () => {
    expect(isGeneratedAudioUrl(BUCKET_URL)).toBe(true);
    expect(isGeneratedAudioUrl(LOCAL_URL)).toBe(true);
    expect(isGeneratedAudioUrl(`https://storage.googleapis.com/b/audio/en/self_hosted/${HASH}.mp3`)).toBe(true);
  });

  it("doesn't take dictionary audio or other links for generated audio", () => {
    expect(isGeneratedAudioUrl(DICTIONARY_URL)).toBe(false);
    expect(isGeneratedAudioUrl("https://example.com/audio/en/google/short.mp3")).toBe(false);
    expect(isGeneratedAudioUrl("")).toBe(false);
    expect(isGeneratedAudioUrl("not a url")).toBe(false);
  });
});

describe("canGenerateAudio", () => {
  const on = { engines: ["google"], name: "wheel", audioUrl: "" };

  it("is offered for a word without audio", () => {
    expect(canGenerateAudio(on)).toBe(true);
  });

  it("is offered again for audio that was generated", () => {
    expect(canGenerateAudio({ ...on, audioUrl: BUCKET_URL })).toBe(true);
  });

  it("isn't offered for dictionary audio, or any other link", () => {
    expect(canGenerateAudio({ ...on, audioUrl: DICTIONARY_URL })).toBe(false);
  });

  it("isn't offered where the server has no engines", () => {
    expect(canGenerateAudio({ ...on, engines: [] })).toBe(false);
  });

  it("counts the name's characters as the server does, up to its limit", () => {
    expect(canGenerateAudio({ ...on, name: "가".repeat(MAX_AUDIO_TEXT_LENGTH) })).toBe(true);
    expect(canGenerateAudio({ ...on, name: "가".repeat(MAX_AUDIO_TEXT_LENGTH + 1) })).toBe(false);
    // An emoji is one code point but two UTF-16 units.
    expect(canGenerateAudio({ ...on, name: "😀".repeat(MAX_AUDIO_TEXT_LENGTH) })).toBe(true);
    expect(canGenerateAudio({ ...on, name: `  ${"a".repeat(MAX_AUDIO_TEXT_LENGTH)}  ` })).toBe(true);
    expect(canGenerateAudio({ ...on, name: "   " })).toBe(false);
  });
});
