import { z } from "zod";

// GameOut
export const gameSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  game_type: z.string(),
  /** Saved words this game can use. */
  total_word_count: z.number(),
  /** Of those, words due for spaced-repetition practice now. */
  due_word_count: z.number(),
  /** When the next word becomes due; null when none is scheduled. */
  next_due_at: z.string().nullable(),
  /** Fewer words than this and the backend refuses to start the game (409). */
  min_word_count: z.number(),
});
export type Game = z.infer<typeof gameSchema>;

export const gamesSchema = z.array(gameSchema);

// GameMode
export type GameMode = "spaced" | "review";
