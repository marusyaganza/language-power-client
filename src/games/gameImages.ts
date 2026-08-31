// games/gameImages.ts
import wordEcho from "@/assets/games/word-echo.webp";
import lexiSense from "@/assets/games/lexi-sense.webp";
import definify from "@/assets/games/definify.webp";
import wordRecall from "@/assets/games/word-recall.webp";
import pictureWordBlitz from "@/assets/games/picture-word-blitz.webp";
import genderWordChallenge from "@/assets/games/gender-word-challenge.webp";
import fallback from "@/assets/games/fallback.webp";

const GAME_IMAGES: Record<string, string> = {
  "word-echo": wordEcho,
  "lexi-sense": lexiSense,
  definify,
  "word-recall": wordRecall,
  "picture-word-blitz": pictureWordBlitz,
  "gender-word-challenge": genderWordChallenge,
};

export function getGameImage(slug: string): string {
  return GAME_IMAGES[slug] ?? fallback;
}