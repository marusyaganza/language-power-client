import type { ReactNode } from "react";
import { Center } from "@mantine/core";

/** A full-screen, centered stage for the game page's loaders, messages and result. */
export function GameScreen({ children }: { children: ReactNode }) {
  return (
    <Center mih="100vh" px="md">
      {children}
    </Center>
  );
}
