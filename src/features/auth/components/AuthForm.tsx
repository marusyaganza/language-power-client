import { Alert, Button, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Credentials } from "../schemas";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (credentials: Credentials) => void;
  isPending: boolean;
  error: Error | null;
  /** Extra password rule, e.g. signup's length limits. Login passes none: the server only answers 401. */
  validatePassword?: (password: string) => string | null;
}

export function AuthForm({ title, submitLabel, onSubmit, isPending, error, validatePassword }: AuthFormProps) {
  const form = useForm<Credentials>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (validatePassword ? validatePassword(value) : null),
    },
  });

  return (
    <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
      <Title order={3} mb="md">
        {title}
      </Title>
      {error && (
        <Alert color="red" mb="md">
          {error.message}
        </Alert>
      )}
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput label="Email" required {...form.getInputProps("email")} />
        <PasswordInput label="Password" required mt="sm" {...form.getInputProps("password")} />
        <Button type="submit" fullWidth mt="lg" loading={isPending} mod={{ "hover-fill": "signal" }}>
          {submitLabel}
        </Button>
      </form>
    </Paper>
  );
}
