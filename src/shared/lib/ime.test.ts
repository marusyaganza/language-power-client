import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { isComposingKey, preventSubmitWhileComposing } from "./ime";

function keyDown(key: string, { isComposing = false, keyCode = 13 } = {}) {
  const event = { key, keyCode, nativeEvent: { isComposing }, preventDefault: vi.fn() };
  return event as unknown as KeyboardEvent<HTMLFormElement> & { preventDefault: ReturnType<typeof vi.fn> };
}

describe("isComposingKey", () => {
  it("is true while an input method composes, as most browsers report it", () => {
    expect(isComposingKey(keyDown("Enter", { isComposing: true }))).toBe(true);
  });

  it("is true for Safari's keyCode 229, even without isComposing", () => {
    expect(isComposingKey(keyDown("Enter", { keyCode: 229 }))).toBe(true);
  });

  it("is false for an ordinary key press", () => {
    expect(isComposingKey(keyDown("Enter"))).toBe(false);
  });
});

describe("preventSubmitWhileComposing", () => {
  it("stops Enter from submitting while a syllable is being composed", () => {
    const event = keyDown("Enter", { isComposing: true });
    preventSubmitWhileComposing(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("lets Enter submit once the syllable is finished", () => {
    const event = keyDown("Enter");
    preventSubmitWhileComposing(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("leaves other keys alone while composing", () => {
    const event = keyDown("ㄱ", { isComposing: true, keyCode: 229 });
    preventSubmitWhileComposing(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
