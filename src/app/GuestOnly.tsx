import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth";
import { paths } from "@/shared/paths";

/**
 * Login and signup are for logged-out users; a logged-in user goes to the app.
 * The page renders while /auth/me is pending or failing, so logged-out users never wait for it.
 */
export function GuestOnly() {
  const { data: user } = useCurrentUser();
  if (user) return <Navigate to={paths.search} replace />;
  return <Outlet />;
}
