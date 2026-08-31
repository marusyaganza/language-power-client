import { Container, Title, Text, Stack, SimpleGrid, Skeleton } from "@mantine/core";
import { useLanguage } from "@/context/LanguageContext";
import { useGames } from "@/hooks/useGames";
import { GameCard } from "@/components/GameCard";

export function GamesPage() {
  const { language } = useLanguage();
  const { data: games, isLoading, isError } = useGames(language);

  return (
    <Container size="lg" py="xl">
      <Stack gap={4} mb="xl">
        <Title order={1}>Your words are ready. Are you?</Title>
        <Text c="dimmed" size="lg">
          Pick a game below and start practicing.
        </Text>
      </Stack>

      {isLoading && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={280} radius="md" />
          ))}
        </SimpleGrid>
      )}

      {isError && (
        <Text c="red">Couldn't load games. Try refreshing the page.</Text>
      )}

      {games && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}