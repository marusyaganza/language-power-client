import { Anchor, Text } from "@mantine/core";
import { Link } from "react-router-dom";

interface AuthLinkProps {
  prompt: string;
  label: string;
  to: string;
}

/** "No account yet? Sign up": the way between the login and signup pages. */
export function AuthLink({ prompt, label, to }: AuthLinkProps) {
  return (
    <Text size="sm" c="dimmed" ta="center">
      {prompt}{" "}
      <Anchor component={Link} to={to} size="sm">
        {label}
      </Anchor>
    </Text>
  );
}
