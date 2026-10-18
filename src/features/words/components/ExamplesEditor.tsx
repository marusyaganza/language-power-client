import { ActionIcon, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { ExampleDraft } from "../lib/wordForm";

interface ExamplesEditorProps {
  examples: ExampleDraft[];
  onExamplesChange: (examples: ExampleDraft[]) => void;
  hideTranslation?: boolean;
}

export function ExamplesEditor({ examples, onExamplesChange, hideTranslation }: ExamplesEditorProps) {
  function updateExample(index: number, field: keyof ExampleDraft, value: string) {
    const next = [...examples];
    next[index] = { ...next[index], [field]: value };
    onExamplesChange(next);
  }

  function removeExample(index: number) {
    onExamplesChange(examples.filter((_, i) => i !== index));
  }

  function addExample() {
    onExamplesChange([...examples, { text: "", translation: "" }]);
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={600}>
        Examples
      </Text>
      {examples.map((ex, i) => (
        <Group key={i} gap="xs" wrap="nowrap" align="flex-start">
          <Stack gap={4} style={{ flex: 1 }}>
            <TextInput
              placeholder="Example text"
              value={ex.text}
              onChange={(e) => updateExample(i, "text", e.currentTarget.value)}
            />
            {!hideTranslation && (
              <TextInput
                placeholder="Translation (optional)"
                value={ex.translation}
                onChange={(e) => updateExample(i, "translation", e.currentTarget.value)}
              />
            )}
          </Stack>
          <ActionIcon variant="subtle" color="scarlet" onClick={() => removeExample(i)} aria-label="Remove example">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button variant="sage" size="xs" leftSection={<IconPlus size={14} />} onClick={addExample}>
        Add example
      </Button>
    </Stack>
  );
}
