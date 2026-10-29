import { ActionIcon, Button, Group, Radio, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { HelpLabel } from "@/shared/components/HelpLabel";
import { WORD_LIMITS } from "../lib/wordForm";

const MAIN_DEF_HELP =
  "The main definition is the word's key meaning, shown first. It's the right answer in Pick the Meaning " +
  "and the first clue in Pick the Word and Type the Word. Listen & Type, Name the Picture and Noun Gender " +
  "show it after you answer.";

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
      <Text size="sm" fw={600} component="div">
        <HelpLabel label="Definitions" help={MAIN_DEF_HELP} />
      </Text>
      {defs.map((def, i) => (
        <Group key={i} gap="xs" wrap="nowrap">
          <TextInput value={def} onChange={(e) => updateDef(i, e.currentTarget.value)} style={{ flex: 1 }} />
          <Tooltip label={i === mainIndex ? "This is the main definition" : "Make this the main definition"}>
            <Radio
              label="main"
              size="xs"
              color="olive"
              checked={i === mainIndex}
              onChange={() => onMainIndexChange(i)}
              aria-label={i === mainIndex ? "Main definition" : "Make this the main definition"}
            />
          </Tooltip>
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
      <Button
        variant="sage"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={addDef}
        disabled={defs.length >= WORD_LIMITS.defs}
      >
        Add definition
      </Button>
    </Stack>
  );
}
