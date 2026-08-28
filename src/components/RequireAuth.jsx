import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function RequireAuth() {
    const { data: user, isLoading, isError } = useCurrentUser();

    if (isLoading) return null; // or a spinner/skeleton

    if (isError || !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}