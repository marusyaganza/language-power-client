// Per-user settings (theme, study language, game sound) in localStorage, keyed by user id so people sharing
// a device keep their own. Logout leaves them in place.
import { z } from "zod";

const PREFIX = "prefs:";

const userPrefsSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  language: z.string().optional(),
  /** Games play no sound on their own (and load none). */
  muted: z.boolean().optional(),
});
export type UserPrefs = z.infer<typeof userPrefsSchema>;

/** The saved settings, or {} if there are none or they're unreadable. */
export function loadUserPrefs(userId: number): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFIX + userId);
    if (!raw) return {};
    const parsed = userPrefsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function saveUserPrefs(userId: number, changes: UserPrefs): void {
  try {
    localStorage.setItem(PREFIX + userId, JSON.stringify({ ...loadUserPrefs(userId), ...changes }));
  } catch {
    // Storage unavailable: the setting still applies, it just won't be remembered.
  }
}
