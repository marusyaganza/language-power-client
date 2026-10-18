import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useLogin } from "../queries";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      onSubmit={(credentials) => login.mutate(credentials, { onSuccess: () => navigate("/words/search") })}
      isPending={login.isPending}
      error={login.error}
    />
  );
}
