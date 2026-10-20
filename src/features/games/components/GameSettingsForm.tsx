import { ActionIcon, Button, Group, NumberInput, Select, Stack, Switch, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { HelpLabel } from "@/shared/components/HelpLabel";
import {
  MAX_GRADUATING_DAYS,
  MAX_LEARNING_STEPS,
  MIN_LEARNING_STEPS,
  matchingPreset,
  settingsToFormValues,
  toGameSettingsUpdate,
  validateGameSettings,
  type GameSettingsFormValues,
  type StepUnit,
} from "../lib/gameSettingsForm";
import type { GameSettings, GameSettingsPreset, GameSettingsUpdate } from "../schemas";
import { SettingsTimeline } from "./SettingsTimeline";

const CUSTOM = "custom";

const UNIT_OPTIONS: { value: StepUnit; label: string }[] = [
  { value: "minutes", label: "minutes" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
];

const HELP = {
  steps:
    "How soon a new word comes back while you're still learning it. Each correct answer moves it to the next step. A wrong answer starts it over.",
  graduating:
    "How long to wait after the last learning step before reviewing the word again. From then on, the wait grows with each correct answer, up to 90 days.",
  strict:
    "When on, forgetting a word you had already learned sends it back to the first learning step. When off, the wait before its next review is cut in half instead.",
};

interface GameSettingsFormProps {
  /** Read once on mount. */
  settings: GameSettings;
  presets: GameSettingsPreset[];
  isPending: boolean;
  onSubmit: (settings: GameSettingsUpdate) => void;
  onCancel: () => void;
}

export function GameSettingsForm({ settings, presets, isPending, onSubmit, onCancel }: GameSettingsFormProps) {
  const form = useForm<GameSettingsFormValues>({
    initialValues: settingsToFormValues(settings),
    validate: validateGameSettings,
  });
  const { values } = form;
  // Derived, not stored: editing a value away from a preset shows "Custom", editing back shows the preset again.
  const preset = matchingPreset(values, presets);

  function applyPreset(id: string | null) {
    const chosen = presets.find((p) => p.id === id);
    if (chosen) form.setValues(settingsToFormValues(chosen.settings));
  }

  function addStep() {
    if (values.steps.length >= MAX_LEARNING_STEPS) return;
    const last = values.steps[values.steps.length - 1];
    form.insertListItem("steps", { amount: "", unit: last?.unit ?? "days" });
  }

  function removeStep(index: number) {
    if (values.steps.length <= MIN_LEARNING_STEPS) return;
    form.removeListItem("steps", index);
  }

  function submit(formValues: GameSettingsFormValues) {
    const update = toGameSettingsUpdate(formValues);
    if (update) onSubmit(update); // always set once validation passes
  }

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack gap="lg">
        <Select
          label="Preset"
          data={[
            ...presets.map((p) => ({ value: p.id, label: p.title })),
            { value: CUSTOM, label: "Custom", disabled: true },
          ]}
          value={preset?.id ?? CUSTOM}
          onChange={applyPreset}
          allowDeselect={false}
          description={preset?.description ?? "Your own settings."}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500} ff="var(--app-font-ui)">
            <HelpLabel label="Learning steps" help={HELP.steps} />
          </Text>
          {values.steps.map((_, i) => (
            <Group key={i} gap="xs" wrap="nowrap" align="flex-start">
              <NumberInput
                aria-label={`Step ${i + 1}`}
                min={1}
                allowDecimal={false}
                allowNegative={false}
                style={{ flex: 1 }}
                {...form.getInputProps(`steps.${i}.amount`)}
              />
              <Select
                aria-label={`Step ${i + 1} unit`}
                data={UNIT_OPTIONS}
                allowDeselect={false}
                w={120}
                {...form.getInputProps(`steps.${i}.unit`)}
              />
              <ActionIcon
                variant="subtle"
                color="scarlet"
                size="input-sm"
                onClick={() => removeStep(i)}
                disabled={values.steps.length <= MIN_LEARNING_STEPS}
                aria-label={`Remove step ${i + 1}`}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          {form.errors.steps && (
            <Text c="red" size="sm">
              {form.errors.steps}
            </Text>
          )}
          <Button
            variant="sage"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={addStep}
            disabled={values.steps.length >= MAX_LEARNING_STEPS}
          >
            Add step
          </Button>
        </Stack>

        <NumberInput
          label={<HelpLabel label="Graduating interval" help={HELP.graduating} />}
          rightSection={
            <Text size="sm" c="dimmed" ff="var(--app-font-ui)">
              days
            </Text>
          }
          rightSectionWidth={48}
          rightSectionPointerEvents="none"
          min={1}
          max={MAX_GRADUATING_DAYS}
          allowDecimal={false}
          allowNegative={false}
          {...form.getInputProps("graduatingDays")}
        />

        <Switch
          label={<HelpLabel label="Strict mode" help={HELP.strict} />}
          {...form.getInputProps("strictMode", { type: "checkbox" })}
        />

        <SettingsTimeline values={values} />

        <Text size="sm" c="dimmed">
          Changes apply to each word the next time you answer it. Reviews that are already scheduled keep their dates.
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending} disabled={!form.isDirty()}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
