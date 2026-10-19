import type { ReactNode } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { GameScreen } from "./GameScreen";

interface GameMessageProps {
  title?: string;
  message?: string;
  onBack: () => void;
  /** Extra actions shown before "Back to games". */
  children?: ReactNode;
}

export function GameMessage({ title, message, onBack, children }: GameMessageProps) {
  return (
    <GameScreen>
      <Stack align="center" gap="md" maw={420}>
        {title && <Text fw={600}>{title}</Text>}
        {message && (
          <Text c="dimmed" ta="center">
            {message}
          </Text>
        )}
        <Group>
          {children}
          <Button onClick={onBack}>Back to games</Button>
        </Group>
      </Stack>
    </GameScreen>
  );
}
