import { Button, Container, Flex, Group, List, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconBookmark, IconDeviceGamepad2, IconFlask, IconSearch } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useAuthConfig } from "@/features/auth";
import { AppFooter } from "@/shared/components/AppFooter";
import { paths } from "@/shared/paths";
import { LandingHeader } from "../components/LandingHeader";

const STEPS = [
  { icon: IconSearch, title: "Look it up", text: "Definitions, examples and pronunciation for every word." },
  { icon: IconBookmark, title: "Save it", text: "Keep the words you want in your own vocabulary." },
  { icon: IconDeviceGamepad2, title: "Practise", text: "Six short games, scheduled with spaced repetition." },
];

export function LandingPage() {
  // Requested on arrival: it wakes a cold backend, and the signup page then reads it from the cache.
  const { data: config } = useAuthConfig();

  return (
    <Flex direction="column" mih="100dvh">
      <LandingHeader />

      <Container size="sm" px="md" py={{ base: 48, sm: 80 }} flex={1}>
        <Stack align="center" gap={48}>
          <Stack align="center" gap="lg">
            <Title order={1} ta="center" fz={{ base: 36, sm: 52 }} lh={1.1} c="var(--app-word)">
              Learn the words you need, and keep them
            </Title>
            <Text c="dimmed" ta="center" size="lg" maw={520}>
              Look up words, save the ones you want, and practise them in short games that bring each word back
              just before you'd forget it.
            </Text>
            {/* Hidden only once the backend says sign-up is closed, so a cold start doesn't hide it. */}
            {config?.signup_enabled !== false && (
              <Button component={Link} to={paths.signup} size="lg" mt="sm" mod={{ "hover-fill": "signal" }}>
                Get started
              </Button>
            )}
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" w="100%">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <Stack key={title} align="center" gap={6}>
                <Icon size={28} color="var(--app-signal)" aria-hidden />
                <Title order={2} size="h4" ta="center">
                  {title}
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  {text}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>

          {config?.use_mocks && (
            <Paper withBorder p="lg" maw={520} className="app-frame" style={{ borderColor: "var(--app-border)" }}>
              <Group gap="xs" mb="sm" wrap="nowrap">
                <IconFlask size={20} color="var(--app-signal)" aria-hidden />
                <Title order={2} size="h4">
                  This is a demo
                </Title>
              </Group>
              <List size="sm" spacing={6}>
                <List.Item>
                  The dictionary is a sample, so search works for a fixed list of words. Search for anything to see
                  them.
                </List.Item>
                <List.Item>Any email address works. We never send emails.</List.Item>
                <List.Item>Accounts and their data are deleted after 7 days.</List.Item>
              </List>
            </Paper>
          )}
        </Stack>
      </Container>

      <AppFooter />
    </Flex>
  );
}
