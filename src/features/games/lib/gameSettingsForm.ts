// Pure helpers behind GameSettingsForm: form values, validation (the backend's rules) and the request body.
import type { GameSettingsPreset, GameSettingsUpdate } from "../schemas";

export type StepUnit = "minutes" | "hours" | "days";

export const MINUTES_PER_UNIT: Record<StepUnit, number> = { minutes: 1, hours: 60, days: 1440 };

const MAX_STEP_MINUTES = 90 * MINUTES_PER_UNIT.days;
export const MIN_LEARNING_STEPS = 1;
export const MAX_LEARNING_STEPS = 5;
export const MAX_GRADUATING_DAYS = 90;

/** NumberInput reports an empty or partly typed field as a string. */
type NumberValue = number | string;

export interface LearningStepDraft {
  amount: NumberValue;
  unit: StepUnit;
}

export interface GameSettingsFormValues {
  steps: LearningStepDraft[];
  graduatingDays: NumberValue;
  strictMode: boolean;
}

/** Shows a step in the largest unit that keeps it whole: 1440 → 1 day, 240 → 4 hours, 90 → 90 minutes. */
export function minutesToStep(minutes: number): LearningStepDraft {
  if (minutes % MINUTES_PER_UNIT.days === 0) return { amount: minutes / MINUTES_PER_UNIT.days, unit: "days" };
  if (minutes % MINUTES_PER_UNIT.hours === 0) return { amount: minutes / MINUTES_PER_UNIT.hours, unit: "hours" };
  return { amount: minutes, unit: "minutes" };
}

/** Null when the amount isn't a positive whole number. */
export function stepToMinutes(step: LearningStepDraft): number | null {
  const { amount } = step;
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount < 1) return null;
  return amount * MINUTES_PER_UNIT[step.unit];
}

export function settingsToFormValues(settings: GameSettingsUpdate): GameSettingsFormValues {
  return {
    steps: settings.learning_steps_minutes.map(minutesToStep),
    graduatingDays: settings.graduating_interval_days,
    strictMode: settings.strict_mode,
  };
}

/** Null while any field is empty or not a whole number. */
export function toGameSettingsUpdate(values: GameSettingsFormValues): GameSettingsUpdate | null {
  const steps = values.steps.map(stepToMinutes);
  const { graduatingDays } = values;
  if (steps.some((m) => m === null) || typeof graduatingDays !== "number" || !Number.isInteger(graduatingDays)) {
    return null;
  }
  return {
    learning_steps_minutes: steps as number[],
    graduating_interval_days: graduatingDays,
    strict_mode: values.strictMode,
  };
}

/** The preset whose values the form holds, or null for custom settings. */
export function matchingPreset(
  values: GameSettingsFormValues,
  presets: GameSettingsPreset[],
): GameSettingsPreset | null {
  const update = toGameSettingsUpdate(values);
  if (update === null) return null;
  return (
    presets.find(
      ({ settings }) =>
        settings.graduating_interval_days === update.graduating_interval_days &&
        settings.strict_mode === update.strict_mode &&
        settings.learning_steps_minutes.length === update.learning_steps_minutes.length &&
        settings.learning_steps_minutes.every((m, i) => m === update.learning_steps_minutes[i]),
    ) ?? null
  );
}

/** Errors keyed by Mantine form path (`steps`, `steps.1.amount`, `graduatingDays`). Mirrors the backend's 422 rules. */
export function validateGameSettings(values: GameSettingsFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  // The form's add/remove buttons keep the count in range; this guards the request anyway.
  if (values.steps.length < MIN_LEARNING_STEPS || values.steps.length > MAX_LEARNING_STEPS) {
    errors.steps = `Use ${MIN_LEARNING_STEPS} to ${MAX_LEARNING_STEPS} learning steps`;
  }

  let previous: number | null = null;
  values.steps.forEach((step, i) => {
    const minutes = stepToMinutes(step);
    const path = `steps.${i}.amount`;
    if (minutes === null) errors[path] = "Enter a whole number";
    else if (minutes > MAX_STEP_MINUTES) errors[path] = "At most 90 days";
    else if (previous !== null && minutes <= previous) errors[path] = "Must be longer than the step before";
    if (minutes !== null) previous = minutes;
  });

  const { graduatingDays } = values;
  const lastStep = stepToMinutes(values.steps[values.steps.length - 1] ?? { amount: "", unit: "minutes" });
  if (typeof graduatingDays !== "number" || !Number.isInteger(graduatingDays)) {
    errors.graduatingDays = "Enter a whole number of days";
  } else if (graduatingDays < 1 || graduatingDays > MAX_GRADUATING_DAYS) {
    errors.graduatingDays = `Between 1 and ${MAX_GRADUATING_DAYS} days`;
  } else if (
    lastStep !== null &&
    lastStep <= MAX_STEP_MINUTES && // an out-of-range step already has its own error
    graduatingDays * MINUTES_PER_UNIT.days < lastStep
  ) {
    errors.graduatingDays = "Can't be shorter than the last learning step";
  }

  return errors;
}

/** "15 min", "4 hours", "1 day": in the largest unit that keeps it whole. */
export function formatDuration(minutes: number): string {
  const { amount, unit } = minutesToStep(minutes);
  if (unit === "minutes") return `${amount} min`;
  const name = unit === "hours" ? "hour" : "day";
  return `${amount} ${name}${amount === 1 ? "" : "s"}`;
}

export interface SettingsTimeline {
  /** Waits while the word is being learned; steps that aren't valid numbers yet are left out. */
  steps: string[];
  /** The first wait once learned; null while the field isn't a valid number. */
  graduating: string | null;
  /** The wait after forgetting a just-learned word (without strict mode); null with `graduating`. */
  lapse: string | null;
}

/** The backend halves a learned word's wait when it's forgotten, but never below 1 day. */
const LAPSE_FACTOR = 0.5;

/** What the preview shows: New word → steps → learned → every N+ days. */
export function settingsTimeline(values: GameSettingsFormValues): SettingsTimeline {
  const steps = values.steps
    .map(stepToMinutes)
    .filter((m): m is number => m !== null)
    .map(formatDuration);
  const { graduatingDays } = values;
  if (typeof graduatingDays !== "number" || !Number.isInteger(graduatingDays) || graduatingDays < 1) {
    return { steps, graduating: null, lapse: null };
  }
  const graduatingMinutes = graduatingDays * MINUTES_PER_UNIT.days;
  return {
    steps,
    graduating: formatDuration(graduatingMinutes),
    // Whole days halve to whole minutes (0.5 day = 720), so formatDuration shows 3.5 days as 84 hours.
    lapse: formatDuration(Math.max(MINUTES_PER_UNIT.days, graduatingMinutes * LAPSE_FACTOR)),
  };
}
