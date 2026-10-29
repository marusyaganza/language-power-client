import { Text } from "@mantine/core";
import { searchLimitText } from "../lib/searchLimit";
import { useSearchLimits } from "../queries";

/** "7 of 10 English searches left" on the demo; nothing where searches aren't limited. */
export function SearchLimit({ language, languageLabel }: { language: string; languageLabel: string }) {
  const { data } = useSearchLimits();
  const text = data ? searchLimitText(data.searches_left[language], data.limit, languageLabel) : null;
  if (text === null) return null;

  return (
    <Text size="sm" c={data?.searches_left[language] === 0 ? "rose" : "dimmed"} aria-live="polite">
      {text}
    </Text>
  );
}
