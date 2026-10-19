import pickTheMeaning from "@/assets/games/pick-the-meaning.webp";
import pickTheWord from "@/assets/games/pick-the-word.webp";
import typeTheWord from "@/assets/games/type-the-word.webp";
import listenAndType from "@/assets/games/listen-and-type.webp";
import nameThePicture from "@/assets/games/name-the-picture.webp";
import nounGender from "@/assets/games/noun-gender.webp";
import fallback from "@/assets/games/fallback.webp";

// Keyed by the game's slug.
const GAME_IMAGES: Record<string, string> = {
  "pick-the-meaning": pickTheMeaning,
  "pick-the-word": pickTheWord,
  "type-the-word": typeTheWord,
  "listen-and-type": listenAndType,
  "name-the-picture": nameThePicture,
  "noun-gender": nounGender,
};

export function getGameImage(slug: string): string {
  return GAME_IMAGES[slug] ?? fallback;
}
