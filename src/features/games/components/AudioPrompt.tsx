import { useEffect, useRef } from "react";
import { ActionIcon } from "@mantine/core";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

/** A big play button for the sound; it also plays once on its own when the sound is shown. */
export function AudioPrompt({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    play(audio);
    return () => audio.pause();
  }, [url]);

  return (
    <ActionIcon
      variant="filled"
      color="rose"
      size={96}
      radius="100%"
      onClick={() => audioRef.current && play(audioRef.current)}
      aria-label="Play the word"
    >
      <IconPlayerPlayFilled size={44} />
    </ActionIcon>
  );
}

function play(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  // Rejected when the browser blocks autoplay (e.g. right after a reload); the button still works.
  audio.play().catch(() => {});
}
