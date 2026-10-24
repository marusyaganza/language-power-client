import type { ReactNode } from "react";
import { Image, Stack, Text, Title } from "@mantine/core";
import logo from "@/assets/logo.png";

/** Logged-out page: the app's name and what it does, then the page's card. */
export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <Stack maw={432} mx="auto" px="md" py="xl" gap="lg">
      <Stack align="center" gap="xs">
        <Image src={logo} alt="" h={56} w="auto" fit="contain" />
        <Title order={1} fz={{ base: 30, sm: 38 }} lh={1.1} ta="center">
          Language Power
        </Title>
        <Text c="dimmed" ta="center">
          Look up words, save them to your vocabulary and practise them in games with spaced repetition.
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}
