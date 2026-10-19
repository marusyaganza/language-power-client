import { Image } from "@mantine/core";

/** `alt` is shown in place of the picture if it fails to load, so it must be a clue, not the answer. */
export function ImagePrompt({ url, alt }: { url: string; alt?: string | null }) {
  return <Image src={url} w="100%" h={280} fit="contain" radius="md" alt={alt || "Picture of the word"} />;
}
