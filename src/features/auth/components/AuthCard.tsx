import type { ReactNode } from "react";
import { Box, Paper, Title } from "@mantine/core";

interface AuthCardProps {
  title: string;
  children: ReactNode;
  /** Shown under the content, e.g. a link to the other auth page. */
  footer?: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <Paper p="lg" withBorder>
      <Title order={2} size="h3" mb="md">
        {title}
      </Title>
      {children}
      {footer && <Box mt="lg">{footer}</Box>}
    </Paper>
  );
}
