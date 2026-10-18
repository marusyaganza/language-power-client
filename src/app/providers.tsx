import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageProvider";
import { cssVariablesResolver, theme } from "@/theme/theme";
import { queryClient } from "./queryClient";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Notifications />
          <ModalsProvider>{children}</ModalsProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
