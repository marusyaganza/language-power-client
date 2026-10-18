import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { GameResult } from "../schemas";

interface ResultScreenProps {
  result: GameResult;
  onFinish: () => void;
}

export function ResultScreen({ result, onFinish }: ResultScreenProps) {
  const rows = [
    { label: "Correct", value: result.correct, color: "green.5" },
    { label: "Almost", value: result.close, color: "orange.5" },
    { label: "Wrong", value: result.wrong, color: "red.5" },
    { label: "Not answered", value: result.unanswered, color: "dimmed" },
  ];

  return (
    <Stack align="center" gap="xl">
      <Title order={2}>Training complete</Title>

      <Paper withBorder p="xl" className="app-frame" miw={280}>
        <Stack gap="md" align="center">
          <Stack gap={0} align="center">
            <Text fz={48} lh={1} c="var(--app-signal)" ff="var(--app-font-ui)">
              {result.score_percent}%
            </Text>
            <span className="app-label">
              Score · {result.total_words} {result.total_words === 1 ? "word" : "words"}
            </span>
          </Stack>

          <Stack gap={6} w="100%">
            {rows.map((row) => (
              <Group key={row.label} justify="space-between">
                <Text size="sm">{row.label}</Text>
                <Text size="sm" c={row.color} ff="var(--app-font-ui)">
                  {row.value}
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Button onClick={onFinish}>Finish</Button>
    </Stack>
  );
}
