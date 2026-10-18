import { Button, Center, Stack, Text } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth";
import { paths } from "@/shared/paths";

export function RequireAuth() {
  const { data: user, isPending, isError, error, refetch, isFetching } = useCurrentUser();

  if (isPending) return null;

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

  return <Outlet />;
}
