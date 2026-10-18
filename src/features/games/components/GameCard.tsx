import { Card, Group, Image, Stack, Text } from "@mantine/core";
import { IconClock, IconLock } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { Game } from "../schemas";
import { getGameAvailability, lockedMessage } from "../lib/gameAvailability";
import { gamePath, type GameOptions } from "../lib/gameOptions";
import { getGameImage } from "../lib/gameImages";
import classes from "./GameCard.module.css";

interface GameCardProps {
  game: Game;
  options: GameOptions;
  /** Current time, for "next word due in …". */
  now: number;
}

export function GameCard({ game, options, now }: GameCardProps) {
  const availability = getGameAvailability(game, options.mode);

  // An array, not a fragment: Card only bleeds the image to the edges when Card.Section is a direct child.
  const content = [
    <Card.Section key="image">
      <Image src={getGameImage(game.slug)} height={160} alt="" />
    </Card.Section>,
    <Stack key="body" gap="xs" mt="md">
      <Text size="lg" className={classes.title}>
        {game.title}
      </Text>
      <Text size="sm" c="dimmed">
        {game.description}
      </Text>
      <span className="app-label">
        {game.due_word_count} due · {game.total_word_count} total
      </span>
      {!availability.playable && (
        <Group gap={6} wrap="nowrap" className={classes.locked}>
          {availability.reason === "needs-words" ? <IconLock size={14} /> : <IconClock size={14} />}
          <span>{lockedMessage(availability, now)}</span>
        </Group>
      )}
    </Stack>,
  ];

  if (!availability.playable) {
    return (
      <Card padding="lg" className={classes.card} data-locked aria-disabled>
        {content}
      </Card>
    );
  }

  return (
    <Card component={Link} to={gamePath(game.id, options)} padding="lg" className={`app-frame ${classes.card}`}>
      {content}
    </Card>
  );
}
