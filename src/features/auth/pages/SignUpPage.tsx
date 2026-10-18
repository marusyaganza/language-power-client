import { Paper, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAuthConfig, useSignup } from "../queries";

export function SignUpPage() {
  const navigate = useNavigate();
  const { data: config, isPending: configPending } = useAuthConfig();
  const signup = useSignup();

  if (configPending) return null;

  if (!config?.signup_enabled) {
    return (
      <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
        <Title order={3} mb="md">
          Sign up is currently closed
        </Title>
      </Paper>
    );
  }

  return (
    <AuthForm
      title="Sign up"
      submitLabel="Sign up"
      onSubmit={(credentials) => signup.mutate(credentials, { onSuccess: () => navigate("/words/search") })}
      isPending={signup.isPending}
      error={signup.error}
    />
  );
}
