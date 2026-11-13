import { useState } from "react";
import { ActionIcon, Button, Group, Select, Stack, Text } from "@mantine/core";
import { IconArrowBackUp, IconPlayerPlayFilled, IconWand } from "@tabler/icons-react";
import { useAuthConfig } from "@/features/auth";
import { HelpLabel } from "@/shared/components/HelpLabel";
import { canGenerateAudio } from "../lib/audioGeneration";
import { useAudioVoices, useGenerateAudio } from "../queries";
import type { GeneratedAudio } from "../schemas";

const HELP =
  "Makes a recording of the word with a computer voice. Listen to it, try other voices, and click Save " +
  "to keep it. Nothing is kept until you save.";

interface AudioGeneratorProps {
  language: string;
  /** The word's name: what is spoken. */
  name: string;
  /** The audio link in the form now. */
  audioUrl: string;
  /** Generated audio not saved yet, as a `data:` URL. */
  preview: string | null;
  onGenerated: (audio: GeneratedAudio) => void;
  /** Back to the audio the word had before generating. */
  onUndo: () => void;
}

/**
 * "Generate audio" on the edit form, for words without audio or with generated audio (never over a
 * dictionary's recording), where the server has an engine. Draws nothing otherwise.
 */
export function AudioGenerator({ language, name, audioUrl, preview, onGenerated, onUndo }: AudioGeneratorProps) {
  const { data: config } = useAuthConfig();
  const engines = config?.audio_engines ?? [];
  const offered = preview !== null || canGenerateAudio({ engines, name, audioUrl });
  // One engine for now (Google); comparing two engines side by side is planned.
  const engine = engines[0];
  const voices = useAudioVoices(language, offered && engine !== undefined);
  const engineVoices = voices.data?.find((v) => v.engine === engine);
  const [voice, setVoice] = useState<string | null>(null);
  const generate = useGenerateAudio();

  if (!offered || engine === undefined) return null;

  const chosenVoice = voice ?? engineVoices?.default ?? null;
  const playable = preview ?? (audioUrl.trim() || null);

  function handleGenerate() {
    generate.mutate(
      { language, text: name.trim(), engine, voice: chosenVoice ?? undefined },
      { onSuccess: (audio) => onGenerated(audio) },
    );
  }

  return (
    <Stack gap={6}>
      <HelpLabel label="Generate audio" help={HELP} />
      <Group gap="xs" wrap="wrap">
        {playable && (
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => new Audio(playable).play().catch(() => {})}
            aria-label="Play the audio"
          >
            <IconPlayerPlayFilled size={18} />
          </ActionIcon>
        )}
        <Select
          aria-label="Voice"
          data={engineVoices?.voices ?? []}
          value={chosenVoice}
          onChange={setVoice}
          allowDeselect={false}
          disabled={generate.isPending || !engineVoices}
          w={140}
        />
        <Button
          variant={playable ? "default" : "filled"}
          leftSection={<IconWand size={16} />}
          loading={generate.isPending}
          disabled={!engineVoices}
          onClick={handleGenerate}
        >
          {playable ? "Regenerate" : "Generate audio"}
        </Button>
        {preview !== null && (
          <Button variant="subtle" leftSection={<IconArrowBackUp size={16} />} onClick={onUndo} disabled={generate.isPending}>
            Undo
          </Button>
        )}
      </Group>
      {preview !== null && (
        <Text size="xs" c="dimmed">
          New audio: kept when you save.
        </Text>
      )}
    </Stack>
  );
}
