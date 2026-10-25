// A game session the backend no longer has. Redis drops an unfinished session 20 minutes after its last
// activity (start or answer). The client only sends session ids the server gave it, so a 404 from the
// answers or result endpoint means the session is gone.
import { isApiError } from "@/api/errors";

/** Which request found the session gone: sending an answer, or asking for the result. */
export type ExpiredDuring = "answer" | "result";

export const SESSION_EXPIRED_TITLE = "This game has timed out";

export function isSessionExpired(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

/**
 * What happened to the player's answers. Each answer is saved as soon as it's graded, so the ones
 * graded before expiry are kept; an answer sent after expiry never reached a session and is lost.
 */
export function sessionExpiredMessage(during: ExpiredDuring, savedAnswers: number): string {
  const saved =
    during === "answer"
      ? savedAnswers > 0
        ? "Your last answer came in after that, so it wasn't saved. Your earlier answers were."
        : "Your answer came in after that, so it wasn't saved."
      : savedAnswers > 0
        ? "All your answers were saved."
        : "";
  return ["No answer for 20 minutes, so the game ended.", saved, "Start a new game to continue."]
    .filter(Boolean)
    .join(" ");
}
