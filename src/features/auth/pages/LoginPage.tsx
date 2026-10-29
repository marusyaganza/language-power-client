import { useState } from "react";
import { Anchor, Group, Paper, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "@/shared/paths";
import { AuthForm } from "../components/AuthForm";
import { AuthLink } from "../components/AuthLink";
import { AuthPage } from "../components/AuthPage";
import { formatHours } from "../lib/demoNotice";
import { hadDemoSession } from "../lib/demoSession";
import { useAuthConfig, useLogin } from "../queries";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  // The form doesn't wait for this: the sign-up link appears once the backend says sign-up is open.
  const { data: config } = useAuthConfig();
  // Read once: logging in marks the session again, and the hint shouldn't flash while the form submits.
  const [hadSession] = useState(hadDemoSession);
  const accountTtl = config?.account_ttl_hours;

  return (
    <AuthPage>
      {hadSession && accountTtl != null && (
        <Paper withBorder p="md" className="app-frame" style={{ borderColor: "var(--app-border)" }}>
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <IconClock size={20} color="var(--app-signal)" aria-hidden style={{ flexShrink: 0 }} />
            <Text size="sm">
              Your demo session has ended. Demo accounts are deleted after {formatHours(accountTtl)}, so yours may be
              gone.
              {config?.signup_open_today && (
                <>
                  {" "}
                  <Anchor component={Link} to={paths.signup} size="sm">
                    Sign up again
                  </Anchor>{" "}
                  to keep exploring.
                </>
              )}
            </Text>
          </Group>
        </Paper>
      )}
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
