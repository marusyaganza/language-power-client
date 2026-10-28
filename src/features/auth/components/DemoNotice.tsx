import { Group, List, Paper, Title } from "@mantine/core";
import { IconFlask } from "@tabler/icons-react";
import type { AuthConfig } from "../schemas";
import { demoNoticeItems } from "../lib/demoNotice";

/** What's different in the demo (limits, account lifetime); renders nothing on other deployments. */
export function DemoNotice({ config }: { config: AuthConfig }) {
  const items = demoNoticeItems(config);
  if (items === null) return null;

  return (
    <Paper withBorder p="lg" maw={520} className="app-frame" style={{ borderColor: "var(--app-border)" }}>
      <Group gap="xs" mb="sm" wrap="nowrap">
        <IconFlask size={20} color="var(--app-signal)" aria-hidden />
        <Title order={2} size="h4">
          This is a demo
        </Title>
      </Group>
      <List size="sm" spacing={6}>
        {items.map((item) => (
          <List.Item key={item}>{item}</List.Item>
        ))}
      </List>
    </Paper>
  );
}
