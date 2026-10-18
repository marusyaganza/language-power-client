import { useEffect, useMemo, useRef } from "react";
import { Container, Group, SegmentedControl, SimpleGrid, Skeleton, Stack, Switch, Text } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/language";
import { useNow } from "@/shared/hooks/useNow";
import { PageHeader } from "@/shared/components/PageHeader";
import { QueryState } from "@/shared/components/QueryState";
import { GameCard } from "../components/GameCard";
import { nextUnlockTime } from "../lib/gameAvailability";
import { clearStoredGames } from "../lib/gameStorage";
import { gameOptionsToParams, parseGameOptions, type GameOptions } from "../lib/gameOptions";
import { useGames } from "../queries";
import type { GameMode } from "../schemas";

const MODE_OPTIONS: { value: GameMode; label: string }[] = [
  { value: "spaced", label: "Spaced repetition" },
  { value: "review", label: "Review" },
];

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  spaced: "Practice the words that are due today.",
  review: "Practice any of your saved words, due or not.",
};

const GRID_COLS = { base: 1, sm: 2, md: 3 };

export function GamesPage() {
  const { language } = useLanguage();
  const games = useGames(language);
  const now = useNow(60_000);
  // Mode and "new words first" live in the URL and are passed on to the game.
  const [searchParams, setSearchParams] = useSearchParams();
  const options = parseGameOptions(searchParams);

  // Coming back to the list ends any game in progress: a card click always starts a fresh session.
  useEffect(() => {
    clearStoredGames();
  }, []);

  // When a game locked by "nothing due" reaches its due time, refetch so its card unlocks.
  const { data: gameList, refetch } = games;
  const unlockAt = useMemo(() => (gameList ? nextUnlockTime(gameList) : null), [gameList]);
  const refetchedFor = useRef<number | null>(null);
  useEffect(() => {
    if (unlockAt === null || unlockAt > now || refetchedFor.current === unlockAt) return;
    refetchedFor.current = unlockAt; // once per due time, even if the backend still says nothing is due
    refetch();
  }, [unlockAt, now, refetch]);

  function changeOptions(change: Partial<GameOptions>) {
    setSearchParams(gameOptionsToParams({ ...options, ...change }), { replace: true });
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <PageHeader title="Your words are ready. Are you?" description="Pick a game below and start practicing." />

        <Stack gap={6}>
          <Group gap="lg" wrap="wrap">
            <SegmentedControl
              data={MODE_OPTIONS}
              value={options.mode}
              onChange={(value) => changeOptions({ mode: value as GameMode })}
              aria-label="Game mode"
            />
            <Switch
              label="New words first"
              checked={options.newWordsFirst}
              onChange={(e) => changeOptions({ newWordsFirst: e.currentTarget.checked })}
            />
          </Group>
          <Text size="sm" c="dimmed">
            {MODE_DESCRIPTIONS[options.mode]}
            {options.newWordsFirst && " Words you haven't practiced in a game come first."}
          </Text>
        </Stack>

        <QueryState
          query={games}
          errorTitle="Couldn't load games"
          loading={
            <SimpleGrid cols={GRID_COLS} spacing="lg">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={320} radius="sm" />
              ))}
            </SimpleGrid>
          }
        >
          {(list) => (
            <SimpleGrid cols={GRID_COLS} spacing="lg">
              {list.map((game) => (
                <GameCard key={game.id} game={game} options={options} now={now} />
              ))}
            </SimpleGrid>
          )}
        </QueryState>
      </Stack>
    </Container>
  );
}
