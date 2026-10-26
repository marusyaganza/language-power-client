import { useEffect } from "react";
import { Button, Center, Group, Stack, Text } from "@mantine/core";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { paths } from "@/shared/paths";
import { reportError } from "./sentry";

/** Shown when rendering or loading a page throws (e.g. a lazy page chunk fails to download). */
export function RouteError() {
  const error = useRouteError();

  // React Router catches these, so they never reach the global error handlers: report them here.
  // Route responses (e.g. a 404) are expected, not bugs.
  useEffect(() => {
    if (!isRouteErrorResponse(error)) reportError(error);
  }, [error]);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <Center mih="60vh" px="md">
      <Stack align="center" gap="sm" maw={480}>
        <Text fw={600}>Something went wrong</Text>
        <Text c="dimmed" ta="center">
          {message}
        </Text>
        <Group>
          <Button variant="default" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button component={Link} to={paths.search}>
            Go to search
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
