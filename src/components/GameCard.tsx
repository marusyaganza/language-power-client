// components/GameCard.tsx
import { Card, Image, Text, Badge, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Game } from "@/types/game";
import { getGameImage } from "@/games/gameImages";

export function GameCard({ game }: { game: Game }) {
  const navigate = useNavigate();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={game.isEnabled ? () => navigate(`/games/${game.id}`) : undefined}
      style={{
        opacity: game.isEnabled ? 1 : 0.55,
        cursor: game.isEnabled ? "pointer" : "not-allowed",
      }}
    >
      <Card.Section>
        <Image src={getGameImage(game.slug)} height={160} alt={game.title} />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={600}>{game.title}</Text>
        {!game.isEnabled && <Badge color="gray">No words saved yet</Badge>}
      </Group>

      <Text size="sm" c="dimmed">
        {game.description}
      </Text>

      {game.isEnabled && (
        <Text size="xs" c="dimmed" mt="sm">
          {game.availableWordCount} word{game.availableWordCount === 1 ? "" : "s"} ready
        </Text>
      )}
    </Card>
  );
}