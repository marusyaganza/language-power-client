import { Button, Group, Image, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { paths } from "@/shared/paths";

export function LandingHeader() {
  return (
    <Group component="header" justify="space-between" wrap="nowrap" px="md" h={60}>
      <Group gap="sm" wrap="nowrap">
        <Image src={logo} alt="" h={32} w="auto" fit="contain" />
        <Text ff="var(--app-font-ui)" fw={600}>
          Language Power
        </Text>
      </Group>
      <Button component={Link} to={paths.login} variant="subtle" color="gray" mod={{ "hover-fill": "signal" }}>
        Log in
      </Button>
    </Group>
  );
}
