import type { ReactNode } from "react";
import { Anchor, Flex, Image, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { AppFooter } from "@/shared/components/AppFooter";
import { paths } from "@/shared/paths";

/** Logged-out page: the app's name (linking home) and what it does, then the page's card. */
export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" mih="100dvh">
      <Stack maw={432} w="100%" mx="auto" px="md" py="xl" gap="lg" flex={1}>
        <Stack align="center" gap="xs">
          <Anchor component={Link} to={paths.home} underline="never" c="inherit">
            <Stack align="center" gap="xs">
              <Image src={logo} alt="" h={56} w="auto" fit="contain" />
              <Title order={1} fz={{ base: 30, sm: 38 }} lh={1.1} ta="center">
                Language Power
              </Title>
            </Stack>
          </Anchor>
          <Text c="dimmed" ta="center">
            Look up words, save them to your vocabulary and practise them in games with spaced repetition.
          </Text>
        </Stack>
        {children}
      </Stack>
      <AppFooter />
    </Flex>
  );
}
