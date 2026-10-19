import { ActionIcon } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useCurrentUser } from "@/features/auth";
import { useToggleUserTheme } from "@/theme/userTheme";

export function ThemeToggle() {
  const { data: user } = useCurrentUser();
  const { colorScheme, toggle } = useToggleUserTheme(user?.id);
  const label = colorScheme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <ActionIcon variant="subtle" size="lg" onClick={toggle} aria-label={label} title={label}>
      {colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}
