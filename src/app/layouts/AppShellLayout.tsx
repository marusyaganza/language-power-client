import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const headerStyles = {
  header: {
    backgroundColor: "color-mix(in srgb, var(--mantine-color-body) 82%, transparent)",
    backdropFilter: "blur(8px)",
    borderColor: "var(--app-border)",
  },
};

/** Logged-in pages with the top navigation. */
export function AppShellLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md" styles={headerStyles}>
      <Header />
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
