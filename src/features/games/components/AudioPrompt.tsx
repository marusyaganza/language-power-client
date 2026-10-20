import { useEffect, useEffectEvent } from "react";
import { ActionIcon } from "@mantine/core";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import type { GameAudio } from "../hooks/useGameAudio";

/** A big play button for the sound; it also plays once on its own when shown, unless muted. */
export function AudioPrompt({ url, audio }: { url: string; audio: GameAudio }) {
  const playOnItsOwn = useEffectEvent(() => audio.autoPlay(url));
  const stop = useEffectEvent(() => audio.stop());

  useEffect(() => {
    playOnItsOwn();
    return () => stop();
  }, [url]);

  return (
    <ActionIcon
      variant="filled"
      color="rose"
      size={96}
      radius="100%"
      onClick={() => audio.play(url)}
      aria-label="Play the word"
    >
      <IconPlayerPlayFilled size={44} />
    </ActionIcon>
  );
}
