// The contract between the game page and a game type's player.
import type { GameOptions } from "./gameOptions";

/**
 * The game page only finds the game and picks the player for its `game_type`. The player owns
 * the rest (starting the session, its format, answering, finishing), so game types stay independent.
 */
export interface GamePlayerProps {
  gameId: number;
  /** Fixed for the visit, like `options`. */
  language: string;
  options: GameOptions;
  /** Ends the visit and goes back to the games list. */
  onLeave: () => void;
}
