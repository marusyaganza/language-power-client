import { Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { QueryState } from "@/shared/components/QueryState";
import { paths } from "@/shared/paths";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { AuthLink } from "../components/AuthLink";
import { AuthPage } from "../components/AuthPage";
import { DemoNotice } from "../components/DemoNotice";
import { newPasswordError } from "../lib/password";
import { formatSignupReopen } from "../lib/signupReopen";
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
        {(data) =>
          !data.signup_enabled ? (
            <AuthCard title="Sign up is closed" footer={loginLink}>
              <Text c="dimmed">New accounts can't be created right now.</Text>
            </AuthCard>
          ) : !data.signup_open_today ? (
            <AuthCard title="Registration is closed for today" footer={loginLink}>
              <Text c="dimmed">
                Sorry, today's new accounts are all taken. Registration opens again {formatSignupReopen(new Date())},
                your time.
              </Text>
            </AuthCard>
          ) : (
            <>
              <DemoNotice config={data} />
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
            </>
          )
        }
      </QueryState>
    </AuthPage>
  );
}
