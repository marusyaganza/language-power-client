// The gender game's answer: ticked genders <-> the string the backend expects.
// One ticked is sent as is ("masculine"); masculine and feminine together are sent as "both".

const BOTH = "both";
const BOTH_GENDERS = ["masculine", "feminine"];

/** The answer to send for the ticked genders; "" when nothing is ticked. */
export function encodeGenderAnswer(ticked: string[]): string {
  if (ticked.length === BOTH_GENDERS.length && BOTH_GENDERS.every((g) => ticked.includes(g))) return BOTH;
  return ticked.length === 1 ? ticked[0] : "";
}

/** The genders an answer stands for (the player's, or the backend's correct one). */
export function decodeGenderAnswer(answer: string): string[] {
  if (answer === BOTH) return BOTH_GENDERS;
  return answer ? [answer] : [];
}

/** Ticks or unticks `gender`, keeping the options' order. */
export function toggleGender(answer: string, gender: string, options: string[]): string {
  const ticked = decodeGenderAnswer(answer);
  const next = ticked.includes(gender) ? ticked.filter((g) => g !== gender) : [...ticked, gender];
  return encodeGenderAnswer(options.filter((o) => next.includes(o)));
}

export type GenderOptionResult = "correct" | "missed" | "wrong";

/** How an option is marked after grading: ticked and expected, expected but not ticked, or ticked by mistake. */
export function genderOptionResult(option: string, ticked: string[], expected: string[]): GenderOptionResult | undefined {
  if (expected.includes(option)) return ticked.includes(option) ? "correct" : "missed";
  return ticked.includes(option) ? "wrong" : undefined;
}
