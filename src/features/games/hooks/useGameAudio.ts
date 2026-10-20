// One audio player for the whole game, with the user's mute setting.
import { useEffect, useRef, useState } from "react";
import { loadUserPrefs, saveUserPrefs } from "@/shared/lib/userPrefs";

// 10ms of silence. Played during the first tap so iOS Safari lets this element play later
// sounds that don't start from a tap (e.g. once an answer comes back from the server).
const SILENCE =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

export interface GameAudio {
  muted: boolean;
  toggleMuted: () => void;
  /** Plays when asked, muted or not: the player pressed a play button. */
  play: (url: string) => void;
  /** Plays unless muted. Muted loads nothing, which also saves mobile data. */
  autoPlay: (url: string) => void;
  stop: () => void;
}

/**
 * A single reused element rather than `new Audio()` per sound: a new sound replaces the last one
 * (no overlaps), and the element unlocked by the first tap stays allowed to play.
 */
export function useGameAudio(userId: number | undefined): GameAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => (userId === undefined ? false : (loadUserPrefs(userId).muted ?? false)));

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    function unlock() {
      removeListeners();
      if (!audio.paused) return; // already playing, so already allowed
      audio.src = SILENCE;
      audio.play().catch(() => {});
    }
    function removeListeners() {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      removeListeners();
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
    };
  }, []);

  function play(url: string) {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.src !== url) audio.src = url;
    audio.currentTime = 0;
    // Rejected when the browser blocks sound without a tap first (e.g. right after a reload): the button still works.
    audio.play().catch(() => {});
  }

  function stop() {
    audioRef.current?.pause();
  }

  function toggleMuted() {
    const next = !muted;
    setMuted(next);
    if (next) stop();
    if (userId !== undefined) saveUserPrefs(userId, { muted: next });
  }

  return { muted, toggleMuted, play, autoPlay: (url) => !muted && play(url), stop };
}
