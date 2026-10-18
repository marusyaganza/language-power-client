import { AppShell, Button, Group, Image, Select } from "@mantine/core";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/language";
import { useLogout } from "@/features/auth";
import { paths } from "@/shared/paths";
import logo from "@/assets/logo.png";
import classes from "./Header.module.css";

const NAV_LINKS = [
  { to: paths.search, label: "Search" },
  { to: paths.vocabulary, label: "Vocabulary" },
  { to: paths.games, label: "Games" },
];

export function Header() {
  const navigate = useNavigate();
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => navigate(paths.login) });
  }

  return (
    <AppShell.Header p="md">
      <Group justify="space-between" h="100%">
        <Group gap="xl">
          <Image src={logo} alt="App logo" h={32} w="auto" fit="contain" />

          <Group gap="md" component="nav">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={classes.link}>
                {label}
              </NavLink>
            ))}
          </Group>
        </Group>

        <Group gap="md">
          <Select
            data={SUPPORTED_LANGUAGES}
            value={language}
            onChange={(value) => value && setLanguage(value)}
            allowDeselect={false}
            w={140}
            aria-label="Study language"
          />
          <Button variant="subtle" color="gray" mod={{ "hover-fill": "signal" }} onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
