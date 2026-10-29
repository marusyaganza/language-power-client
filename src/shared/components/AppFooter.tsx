import { Anchor, Group, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import classes from "./AppFooter.module.css";

const REPO_URL = "https://github.com/marusyaganza/language-power-client";

/** Bottom of every page except the full-screen game. */
export function AppFooter() {
  return (
    <Group component="footer" justify="space-between" gap="xs" px="md" py="lg" className={classes.footer}>
      <Text size="sm" c="dimmed">
        Language Power
      </Text>
      <Anchor href={REPO_URL} target="_blank" rel="noreferrer" size="sm" c="dimmed" underline="hover">
        <Group component="span" gap={6} wrap="nowrap">
          <IconBrandGithub size={16} aria-hidden />
          Source on GitHub
        </Group>
      </Anchor>
    </Group>
  );
}
