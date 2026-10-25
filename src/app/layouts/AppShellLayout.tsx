import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { AppFooter } from "@/shared/components/AppFooter";
import { Header } from "./Header";

const headerStyles = {
  header: {
    backgroundColor: "color-mix(in srgb, var(--mantine-color-body) 82%, transparent)",
    backdropFilter: "blur(8px)",
    borderColor: "var(--app-border)",
  },
};

/** Logged-in pages with the top navigation. The footer follows the page content, at the bottom of short pages. */
export function AppShellLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md" styles={headerStyles}>
      <Header />
      <AppShell.Main display="flex" style={{ flexDirection: "column" }}>
        <Box flex={1}>
          <Outlet />
        </Box>
        <AppFooter />
      </AppShell.Main>
    </AppShell>
  );
}
