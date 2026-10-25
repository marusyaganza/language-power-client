import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth";
import { paths } from "@/shared/paths";

export function LogoutButton() {
  const navigate = useNavigate();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => navigate(paths.home) });
  }

  return (
    <Button variant="subtle" color="gray" mod={{ "hover-fill": "signal" }} onClick={handleLogout}>
      Logout
    </Button>
  );
}
