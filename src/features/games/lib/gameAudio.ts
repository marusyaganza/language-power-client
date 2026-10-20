// When a game plays the word's audio on its own.

/**
 * `start`: as soon as the question shows, for games whose question already shows the word.
 * `feedback`: once answered, for games where hearing the word would give the answer away.
 */
export type AutoPlayMoment = "start" | "feedback";

interface AutoPlayInput {
  moment: AutoPlayMoment;
  answered: boolean;
  muted: boolean;
  audioUrl: string | null | undefined;
}

/** The audio to play on its own now, or null. Muted plays nothing (and so loads nothing). */
export function autoPlayUrl({ moment, answered, muted, audioUrl }: AutoPlayInput): string | null {
  if (muted || !audioUrl) return null;
  if (moment === "feedback" && !answered) return null;
  return audioUrl;
}
