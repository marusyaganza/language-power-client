import { Button, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { wordFormValidation, type WordFormMode, type WordFormValues } from "../lib/wordForm";
import { DefsEditor } from "./DefsEditor";
import { ExamplesEditor } from "./ExamplesEditor";

const FL_OPTIONS = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "phrase", label: "Phrase" },
  { value: "idiom", label: "Idiom" },
  { value: "other", label: "Other" },
];

interface WordFormProps {
  /** `create` also asks for the word, part of speech and transcription. */
  mode: WordFormMode;
  /** Read once on mount; remount with a new `key` to edit a different word. */
  initialValues: WordFormValues;
  showTranslations: boolean;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: WordFormValues) => void;
  onCancel?: () => void;
}

export function WordForm({
  mode,
  initialValues,
  showTranslations,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: WordFormProps) {
  const form = useForm<WordFormValues>({ initialValues, validate: wordFormValidation(mode) });
  const { values } = form;

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        {mode === "create" && (
          <>
            <TextInput label="Word" withAsterisk {...form.getInputProps("name")} />
            <Select label="Part of speech" data={FL_OPTIONS} withAsterisk {...form.getInputProps("fl")} />
            <TextInput label="Transcription" placeholder="Optional" {...form.getInputProps("transcription")} />
          </>
        )}

        <Stack gap={4}>
          <DefsEditor
            defs={values.defs}
            mainIndex={values.mainDefIndex}
            onDefsChange={(defs) => form.setFieldValue("defs", defs)}
            onMainIndexChange={(index) => form.setFieldValue("mainDefIndex", index)}
          />
          {form.errors.defs && (
            <Text c="red" size="sm">
              {form.errors.defs}
            </Text>
          )}
        </Stack>

        <ExamplesEditor
          examples={values.examples}
          onExamplesChange={(examples) => form.setFieldValue("examples", examples)}
          hideTranslation={!showTranslations}
        />

        <TextInput label="Audio URL" placeholder="Optional" {...form.getInputProps("audioUrl")} />
        <TextInput label="Image URL" placeholder="Optional" {...form.getInputProps("imgUrl")} />
        <TextInput label="Image description" placeholder="Optional" {...form.getInputProps("imgDesc")} />

        <Group justify="flex-end">
          {onCancel && (
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isPending}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
