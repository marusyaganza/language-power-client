import { Text } from "@mantine/core";

export function WordPrompt({ word }: { word: string }) {
  return (
    <Text size="xl" ta="center">
      {word}
    </Text>
  );
}
