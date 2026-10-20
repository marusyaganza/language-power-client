import { Stack, Text } from "@mantine/core";
import classes from "./ExampleList.module.css";

/** Structural, so any feature's examples fit; shared code doesn't import from features. */
interface Example {
  text: string;
  translation?: string | null;
}

export function ExampleList({ examples }: { examples: Example[] }) {
  if (examples.length === 0) return null;

  return (
    <Stack gap={6}>
      {examples.map(({ text, translation }, i) => (
        <Text key={i} size="sm" pl="sm" className={classes.example}>
          {text}
          {translation && (
            <Text span c="dimmed">
              {" "}— {translation}
            </Text>
          )}
        </Text>
      ))}
    </Stack>
  );
}
