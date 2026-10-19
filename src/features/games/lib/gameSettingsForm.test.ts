import { describe, expect, it } from "vitest";
import type { GameSettingsPreset } from "../schemas";
import {
  formatDuration,
  matchingPreset,
  minutesToStep,
  settingsTimeline,
  settingsToFormValues,
  toGameSettingsUpdate,
  validateGameSettings,
  type GameSettingsFormValues,
} from "./gameSettingsForm";

const recommended: GameSettingsPreset = {
  id: "recommended",
  title: "Recommended",
  description: "Steady daily practice",
  settings: { learning_steps_minutes: [15, 1440, 8640], graduating_interval_days: 6, strict_mode: false },
};
const intensive: GameSettingsPreset = {
  id: "intensive",
  title: "Intensive",
  description: "Fast progress",
  settings: { learning_steps_minutes: [15, 240, 1440], graduating_interval_days: 3, strict_mode: true },
};
const presets = [recommended, intensive];

const formValues = (overrides: Partial<GameSettingsFormValues> = {}): GameSettingsFormValues => ({
  ...settingsToFormValues(recommended.settings),
  ...overrides,
});

describe("minutesToStep", () => {
  it("uses the largest whole unit", () => {
    expect(minutesToStep(8640)).toEqual({ amount: 6, unit: "days" });
    expect(minutesToStep(240)).toEqual({ amount: 4, unit: "hours" });
    expect(minutesToStep(90)).toEqual({ amount: 90, unit: "minutes" });
  });
});

describe("toGameSettingsUpdate", () => {
  it("round-trips the settings", () => {
    expect(toGameSettingsUpdate(settingsToFormValues(intensive.settings))).toEqual(intensive.settings);
  });

  it("is null while a field is empty", () => {
    expect(toGameSettingsUpdate(formValues({ graduatingDays: "" }))).toBeNull();
    expect(toGameSettingsUpdate(formValues({ steps: [{ amount: "", unit: "days" }] }))).toBeNull();
  });
});

describe("matchingPreset", () => {
  it("finds the preset the values match", () => {
    expect(matchingPreset(settingsToFormValues(intensive.settings), presets)).toBe(intensive);
  });

  it("matches regardless of the unit a step is shown in", () => {
    const steps = [
      { amount: 15, unit: "minutes" as const },
      { amount: 24, unit: "hours" as const },
      { amount: 6, unit: "days" as const },
    ];
    expect(matchingPreset(formValues({ steps }), presets)).toBe(recommended);
  });

  it("is null for custom values", () => {
    expect(matchingPreset(formValues({ strictMode: true }), presets)).toBeNull();
    expect(matchingPreset(formValues({ steps: [{ amount: 1, unit: "days" }] }), presets)).toBeNull();
  });
});

describe("validateGameSettings", () => {
  it("accepts the presets", () => {
    for (const preset of presets) expect(validateGameSettings(settingsToFormValues(preset.settings))).toEqual({});
  });

  it("requires 1 to 5 learning steps", () => {
    const step = { amount: 1, unit: "minutes" as const };
    expect(validateGameSettings(formValues({ steps: [] })).steps).toBe("Use 1 to 5 learning steps");
    const six = [1, 2, 3, 4, 5, 6].map((amount) => ({ ...step, amount }));
    expect(validateGameSettings(formValues({ steps: six })).steps).toBe("Use 1 to 5 learning steps");
    const five = six.slice(0, 5);
    expect(validateGameSettings(formValues({ steps: five })).steps).toBeUndefined();
  });

  it("requires whole positive amounts", () => {
    const steps = [
      { amount: "", unit: "minutes" as const },
      { amount: 1.5, unit: "hours" as const },
    ];
    expect(validateGameSettings(formValues({ steps }))).toMatchObject({
      "steps.0.amount": "Enter a whole number",
      "steps.1.amount": "Enter a whole number",
    });
  });

  it("requires each step to be longer than the one before", () => {
    const steps = [
      { amount: 1, unit: "days" as const },
      { amount: 24, unit: "hours" as const },
    ];
    expect(validateGameSettings(formValues({ steps }))).toEqual({
      "steps.1.amount": "Must be longer than the step before",
    });
  });

  it("limits steps to 90 days", () => {
    const steps = [{ amount: 91, unit: "days" as const }];
    expect(validateGameSettings(formValues({ steps, graduatingDays: 90 }))).toEqual({
      "steps.0.amount": "At most 90 days",
    });
  });

  it("limits the graduating interval to 1–90 days, and not shorter than the last step", () => {
    expect(validateGameSettings(formValues({ graduatingDays: 0 })).graduatingDays).toBe("Between 1 and 90 days");
    expect(validateGameSettings(formValues({ graduatingDays: 91 })).graduatingDays).toBe("Between 1 and 90 days");
    expect(validateGameSettings(formValues({ graduatingDays: 5 })).graduatingDays).toBe(
      "Can't be shorter than the last learning step",
    );
    expect(validateGameSettings(formValues({ graduatingDays: "" })).graduatingDays).toBe(
      "Enter a whole number of days",
    );
  });
});

describe("formatDuration", () => {
  it("uses short minutes and plural units", () => {
    expect(formatDuration(15)).toBe("15 min");
    expect(formatDuration(60)).toBe("1 hour");
    expect(formatDuration(240)).toBe("4 hours");
    expect(formatDuration(1440)).toBe("1 day");
    expect(formatDuration(8640)).toBe("6 days");
  });
});

describe("settingsTimeline", () => {
  it("lists the steps and the graduating interval", () => {
    expect(settingsTimeline(settingsToFormValues(recommended.settings))).toEqual({
      steps: ["15 min", "1 day", "6 days"],
      graduating: "6 days",
      lapse: "3 days",
    });
  });

  it("halves the graduating interval for a forgotten word, but not below 1 day", () => {
    expect(settingsTimeline(formValues({ graduatingDays: 7 })).lapse).toBe("84 hours");
    expect(settingsTimeline(formValues({ graduatingDays: 1 })).lapse).toBe("1 day");
  });

  it("leaves out values that aren't valid numbers yet", () => {
    const steps = [
      { amount: 15, unit: "minutes" as const },
      { amount: "", unit: "days" as const },
    ];
    expect(settingsTimeline(formValues({ steps, graduatingDays: "" }))).toEqual({
      steps: ["15 min"],
      graduating: null,
      lapse: null,
    });
  });
});
