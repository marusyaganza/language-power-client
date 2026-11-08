import type { KeyboardEvent } from "react";

interface ImeKeyEvent {
  key: string;
  keyCode: number;
  nativeEvent: { isComposing: boolean };
}

/**
 * Whether a key press belongs to an input method's composition, such as a Hangul syllable still being
 * typed. Safari reports some of these presses with `isComposing` false, but always with keyCode 229.
 */
export function isComposingKey(event: ImeKeyEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}

/**
 * For a form's `onKeyDown`: Enter while a syllable is being composed only finishes the syllable. Without
 * this the form submits the text without its last syllable, or twice. Key presses bubble up from every
 * field, so one handler on the form covers them all.
 */
export function preventSubmitWhileComposing(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key === "Enter" && isComposingKey(event)) event.preventDefault();
}
