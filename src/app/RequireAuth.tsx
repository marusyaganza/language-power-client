import { Button, Center, Loader, Stack, Text } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageProvider";
import { useCurrentUser } from "@/features/auth";
import { paths } from "@/shared/paths";
import { useApplyUserTheme } from "@/theme/userTheme";

export function RequireAuth() {
  const { data: user, isPending, isError, error, refetch, isFetching } = useCurrentUser();
  useApplyUserTheme(user?.id);

  // The first request after the API has been idle can take several seconds (Cloud Run cold start).
  if (isPending) {
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
    <LanguageProvider key={user.id} userId={user.id}>
      <Outlet />
    </LanguageProvider>
  );
}
