import { ActionIcon, Button, Group, Radio, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface DefsEditorProps {
  defs: string[];
  mainIndex: number;
  onDefsChange: (defs: string[]) => void;
  onMainIndexChange: (index: number) => void;
}

export function DefsEditor({ defs, mainIndex, onDefsChange, onMainIndexChange }: DefsEditorProps) {
  function updateDef(index: number, value: string) {
    const next = [...defs];
    next[index] = value;
    onDefsChange(next);
  }

  function removeDef(index: number) {
    onDefsChange(defs.filter((_, i) => i !== index));
    if (index === mainIndex) {
      onMainIndexChange(0);
    } else if (index < mainIndex) {
      onMainIndexChange(mainIndex - 1);
    }
  }

  function addDef() {
    onDefsChange([...defs, ""]);
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={600}>
        Definitions
      </Text>
      {defs.map((def, i) => (
        <Group key={i} gap="xs" wrap="nowrap">
          <TextInput value={def} onChange={(e) => updateDef(i, e.currentTarget.value)} style={{ flex: 1 }} />
          {i !== mainIndex && (
            <Radio aria-label="Set as main definition" checked={false} onChange={() => onMainIndexChange(i)} />
          )}
          {i === mainIndex && (
            <Text size="xs" c="dimmed" w={40}>
              main
            </Text>
          )}
          <ActionIcon
            variant="subtle"
            color="scarlet"
            onClick={() => removeDef(i)}
            disabled={defs.length === 1}
            aria-label="Remove definition"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button variant="sage" size="xs" leftSection={<IconPlus size={14} />} onClick={addDef}>
        Add definition
      </Button>
    </Stack>
  );
}
