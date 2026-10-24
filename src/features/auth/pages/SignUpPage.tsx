import { Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { QueryState } from "@/shared/components/QueryState";
import { paths } from "@/shared/paths";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { AuthLink } from "../components/AuthLink";
import { AuthPage } from "../components/AuthPage";
import { newPasswordError } from "../lib/password";
import { useAuthConfig, useSignup } from "../queries";

export function SignUpPage() {
  const navigate = useNavigate();
  const config = useAuthConfig();
  const signup = useSignup();
  const loginLink = <AuthLink prompt="Already have an account?" label="Log in" to={paths.login} />;

  return (
    <AuthPage>
      {/* A failed config request means the server is unreachable, not that sign-up is closed. */}
      <QueryState query={config} errorTitle="Couldn't load sign-up">
        {({ signup_enabled }) =>
          signup_enabled ? (
            <AuthForm
              title="Sign up"
              submitLabel="Sign up"
              onSubmit={(credentials) =>
                signup.mutate(credentials, { onSuccess: () => navigate(paths.search, { replace: true }) })
              }
              isPending={signup.isPending}
              error={signup.error}
              validatePassword={newPasswordError}
              footer={loginLink}
            />
          ) : (
            <AuthCard title="Sign up is closed" footer={loginLink}>
              <Text c="dimmed">New accounts can't be created right now.</Text>
            </AuthCard>
          )
        }
      </QueryState>
    </AuthPage>
  );
}
