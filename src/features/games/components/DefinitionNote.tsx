import { Text } from "@mantine/core";

/** The `def` hint, e.g. "hola means hello!, hi!". It names the word, so show it only after answering. */
export function DefinitionNote({ def }: { def?: string | null }) {
  if (!def) return null;
  return (
    <Text ta="center" mt="md">
      {def}
    </Text>
  );
}
