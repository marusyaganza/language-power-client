import { AppShell, Burger, Drawer, Group, Image, Stack, useMatches } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";
import { paths } from "@/shared/paths";
import logo from "@/assets/logo.png";
import classes from "./Header.module.css";
import { LanguageSelect } from "./LanguageSelect";
import { LogoutButton } from "./LogoutButton";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

/** From `sm` up everything sits in the bar; below it, the logo and a burger that opens a menu. */
export function Header() {
  const [menuOpened, menu] = useDisclosure(false);
  // The menu only exists below `sm`, so widening the window closes it (and releases its scroll lock).
  const isPhone = useMatches({ base: true, sm: false });

  return (
    <AppShell.Header p="md">
      <Group justify="space-between" h="100%" wrap="nowrap">
        <Group gap="xl" wrap="nowrap">
          <Link to={paths.search} className={classes.logo}>
            <Image src={logo} alt="Language Power" h={32} w="auto" fit="contain" />
          </Link>

          <Group gap="md" component="nav" aria-label="Main" visibleFrom="sm">
            <NavLinks />
          </Group>
        </Group>

        <Group gap="md" wrap="nowrap" visibleFrom="sm">
          <LanguageSelect w={140} />
          <ThemeToggle />
          <LogoutButton />
        </Group>

        <Burger
          opened={menuOpened}
          onClick={menu.toggle}
          hiddenFrom="sm"
          size="sm"
          aria-label={menuOpened ? "Close menu" : "Open menu"}
        />
      </Group>

      <Drawer opened={menuOpened && isPhone} onClose={menu.close} position="right" size="xs" title="Menu">
        <Stack gap="xl">
          <Stack component="nav" aria-label="Main" gap="xs" align="flex-start">
            <NavLinks onNavigate={menu.close} linkClassName={classes.menuLink} />
          </Stack>
          <LanguageSelect label="Study language" />
          <Group justify="space-between">
            <ThemeToggle />
            <LogoutButton />
          </Group>
        </Stack>
      </Drawer>
    </AppShell.Header>
  );
}
