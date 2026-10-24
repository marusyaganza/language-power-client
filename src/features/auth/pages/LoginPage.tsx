import { useNavigate } from "react-router-dom";
import { paths } from "@/shared/paths";
import { AuthForm } from "../components/AuthForm";
import { AuthLink } from "../components/AuthLink";
import { AuthPage } from "../components/AuthPage";
import { useAuthConfig, useLogin } from "../queries";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  // The form doesn't wait for this: the sign-up link appears once the backend says sign-up is open.
  const { data: config } = useAuthConfig();

  return (
    <AuthPage>
      <AuthForm
        title="Log in"
        submitLabel="Log in"
        // Replace, like GuestOnly's redirect: Back from the app doesn't return to the login form.
        onSubmit={(credentials) =>
          login.mutate(credentials, { onSuccess: () => navigate(paths.search, { replace: true }) })
        }
        isPending={login.isPending}
        error={login.error}
        footer={config?.signup_enabled && <AuthLink prompt="No account yet?" label="Sign up" to={paths.signup} />}
      />
    </AuthPage>
  );
}
