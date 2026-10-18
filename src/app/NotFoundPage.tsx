import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { paths } from "@/shared/paths";

export function NotFoundPage() {
  return (
    <Center mih="100vh" px="md">
      <Stack align="center" gap="sm">
        <span className="app-label">404</span>
        <Title order={2}>This page doesn't exist</Title>
        <Text c="dimmed">The link may be broken, or the page was moved.</Text>
        <Button component={Link} to={paths.search} mt="sm">
          Go to search
        </Button>
      </Stack>
    </Center>
  );
}
