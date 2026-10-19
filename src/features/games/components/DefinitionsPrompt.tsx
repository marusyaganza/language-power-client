import { Stack, Text } from "@mantine/core";

export function DefinitionsPrompt({ definitions }: { definitions: string[] }) {
  return (
    <Stack gap={4} align="center">
      {definitions.map((line, i) => (
        <Text key={i} ta="center">
          🌟 {line}
        </Text>
      ))}
    </Stack>
  );
}
