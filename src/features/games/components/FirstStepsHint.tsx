import { Button, List, Paper, Stack, Text, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { paths } from "@/shared/paths";

/** Shown while the account has no saved words: every game is locked until it does. */
export function FirstStepsHint() {
  return (
    <Paper withBorder p="lg" className="app-frame" style={{ borderColor: "var(--app-border)" }}>
      <Stack gap="sm" align="flex-start">
        <Title order={2} size="h4">
          Start with a few words
        </Title>
        <List type="ordered" size="sm" spacing={4}>
          <List.Item>Search for a word you want to learn.</List.Item>
          <List.Item>Save it to your vocabulary.</List.Item>
          <List.Item>Come back here and play. One word is enough to start; the pick-an-answer games need 4.</List.Item>
        </List>
        <Text size="sm" c="dimmed">
          You can also add words of your own, with your own pictures and audio links.
        </Text>
        <Button component={Link} to={paths.search} leftSection={<IconSearch size={16} />} mod={{ "hover-fill": "signal" }}>
          Search words
        </Button>
      </Stack>
    </Paper>
  );
}
