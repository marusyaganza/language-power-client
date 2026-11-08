import { Button, Center, Loader, Stack, Text } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";
import { offeredLanguages } from "@/context/language";
import { LanguageProvider } from "@/context/LanguageProvider";
import { useAuthConfig, useCurrentUser } from "@/features/auth";
import { paths } from "@/shared/paths";
import { useApplyUserTheme } from "@/theme/userTheme";
import { useErrorReportingUser } from "./sentry";

export function RequireAuth() {
  const { data: user, isPending, isError, error, refetch, isFetching } = useCurrentUser();
  // Which languages to offer. Requested alongside the user, and usually cached by the login page already.
  const config = useAuthConfig();
  useApplyUserTheme(user?.id);
  useErrorReportingUser(user?.id);

  // The first request after the API has been idle can take several seconds (Cloud Run cold start).
  if (isPending || config.isPending) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  // Couldn't ask the server (down, offline): say so instead of pretending the user is logged out.
  if (isError) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="sm">
          <Text fw={600}>Can't reach the server</Text>
          <Text c="dimmed" ta="center">
            {error.message}
          </Text>
          <Button onClick={() => refetch()} loading={isFetching}>
            Try again
          </Button>
        </Stack>
      </Center>
    );
  }

  if (!user) return <Navigate to={paths.login} replace />;

  return (
    // If the config failed, every language is offered: a request in one the server doesn't offer is refused there.
    <LanguageProvider key={user.id} userId={user.id} languages={offeredLanguages(config.data?.languages)}>
      <Outlet />
    </LanguageProvider>
  );
}
