import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { cssVariablesResolver, theme } from "@/theme/theme";
import { queryClient } from "./queryClient";

// LanguageProvider is per user, so it lives in RequireAuth.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="auto">
      <QueryClientProvider client={queryClient}>
        <Notifications />
        <ModalsProvider>{children}</ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
