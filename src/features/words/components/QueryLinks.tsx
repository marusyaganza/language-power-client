import type { ReactNode } from "react";
import { Anchor, Group, Paper, Stack, Text } from "@mantine/core";

interface QueryLinksProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  queries: string[];
  onSelect: (query: string) => void;
}

/** A boxed message followed by clickable search terms (spelling suggestions, demo-mode words). */
export function QueryLinks({ icon, title, description, queries, onSelect }: QueryLinksProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        <Stack gap={2}>
          <Group gap="xs" wrap="nowrap">
            {icon}
            <Text fw={600}>{title}</Text>
          </Group>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        <Group gap="xs">
          {queries.map((query, i) => (
            <span key={i}>
              <Anchor onClick={() => onSelect(query)} underline="hover" size="sm">
                {query}
              </Anchor>
              {i < queries.length - 1 && ","}
            </span>
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}
