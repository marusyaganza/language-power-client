// The logged-in user's light/dark choice. Mantine keeps the last applied scheme under its own key
// (read by the script in index.html, so reloads don't flash); prefs:<userId> remembers it per user.
import { useEffect, useEffectEvent } from "react";
import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { loadUserPrefs, saveUserPrefs } from "@/shared/lib/userPrefs";

/** Applies the user's saved theme once they're known; with none saved, follows the system. */
export function useApplyUserTheme(userId: number | undefined) {
  const { setColorScheme } = useMantineColorScheme();
  const apply = useEffectEvent((id: number) => setColorScheme(loadUserPrefs(id).theme ?? "auto"));

  useEffect(() => {
    if (userId !== undefined) apply(userId);
  }, [userId]);
}

/** The scheme on screen and a switch to the other one, saved for this user. */
export function useToggleUserTheme(userId: number | undefined) {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("dark");

  function toggle() {
    const next = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    if (userId !== undefined) saveUserPrefs(userId, { theme: next });
  }

  return { colorScheme, toggle };
}
