import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth";

export function RequireAuth() {
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) return null;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
